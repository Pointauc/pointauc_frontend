import type { OxygenDonutsDonation } from './donation';

// Protocol reference: https://oxygendonuts.com/developers (live stream over WebSocket).

const EVENT_TYPES = 'donation.created';

/** How long one connection attempt may take until `connection.ready`. */
export const READY_TIMEOUT_MS = 8_000;
/** The backoff is reset only after a connection stayed open this long. */
export const STABLE_CONNECTION_MS = 60_000;
/** Reconnecting stops when the stream could not be restored within this time. */
export const RECONNECT_WINDOW_MS = 5 * 60_000;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const SEEN_EVENTS_LIMIT = 1_000;
const ABNORMAL_CLOSE_CODE = 1006;

export type StreamStatus = 'idle' | 'connecting' | 'open';

/**
 * Why the stream ended on its own:
 * `unauthorized` - the access token is no longer accepted,
 * `failed` - the stream could not be opened or restored.
 */
export type StreamStopReason = 'unauthorized' | 'failed';

export type CloseAction =
  | { type: 'unauthorized' }
  | { type: 'fail' }
  | { type: 'retry'; minDelay?: number; fixedDelay?: number; randomDelay?: [number, number]; dropCursor?: boolean };

/**
 * What to do after the server (or the network) closed the connection with the given code.
 */
export const resolveCloseAction = (code: number): CloseAction => {
  switch (code) {
    case 4001: // token_invalid
    case 4003: // token_revoked
    case 4004: // permission_denied
      return { type: 'unauthorized' };
    case 4030: // streamer_suspended
    case 1008: // invalid_request
      return { type: 'fail' };
    case 4010: // cursor_invalid
    case 4011: // cursor_expired
      return { type: 'retry', dropCursor: true };
    case 4008: // connection_limit
    case 4503: // api_disabled
      return { type: 'retry', fixedDelay: 60_000 };
    case 4029: // rate_limited
      return { type: 'retry', minDelay: 10_000 };
    case 1013: // service_unavailable
      return { type: 'retry', minDelay: 5_000 };
    case 1012: // service_restarting
      return { type: 'retry', randomDelay: [1_000, 10_000] };
    default:
      return { type: 'retry' };
  }
};

/**
 * Capped exponential backoff with jitter: the wait is picked between half and the full value of
 * 1s, 2s, 4s ... 30s.
 *
 * @param failedAttempts - Failed attempts in a row before this one.
 * @param random - A number in [0, 1).
 */
export const getBackoffDelay = (failedAttempts: number, random: number): number => {
  const ceiling = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** failedAttempts);

  return ceiling / 2 + (random * ceiling) / 2;
};

export const getRetryDelay = (
  action: Extract<CloseAction, { type: 'retry' }>,
  failedAttempts: number,
  random: number,
): number => {
  if (action.fixedDelay !== undefined) return action.fixedDelay;
  if (action.randomDelay) return action.randomDelay[0] + random * (action.randomDelay[1] - action.randomDelay[0]);

  return Math.max(action.minDelay ?? 0, getBackoffDelay(failedAttempts, random));
};

/**
 * The browser `WebSocket` cannot send headers, so the token goes into the URL. Never log this URL.
 */
export const buildStreamUrl = (apiOrigin: string, accessToken: string, cursor: string | null): string => {
  const params = new URLSearchParams({ token: accessToken, types: EVENT_TYPES });
  if (cursor) {
    params.set('cursor', cursor);
  }

  return `${apiOrigin.replace(/^http/, 'ws')}/v1/stream?${params.toString()}`;
};

interface StreamFrame {
  id?: unknown;
  type?: unknown;
  data?: {
    cursor?: unknown;
    donation?: unknown;
  };
}

const parseFrame = (data: unknown): StreamFrame | null => {
  if (typeof data !== 'string') return null;

  try {
    const frame: unknown = JSON.parse(data);

    return frame && typeof frame === 'object' ? (frame as StreamFrame) : null;
  } catch {
    return null;
  }
};

const checkIsDonation = (donation: unknown): donation is OxygenDonutsDonation => {
  if (!donation || typeof donation !== 'object') return false;
  const { id, paid_at: paidAt } = donation as Partial<OxygenDonutsDonation>;

  return typeof id === 'string' && typeof paidAt === 'string';
};

interface StreamOptions {
  /** Builds the stream URL for the position to resume from (`null` - live only). */
  buildUrl: (cursor: string | null) => string;
  onStatusChange: (status: StreamStatus) => void;
  onDonation: (donation: OxygenDonutsDonation) => void;
  /** The stream ended on its own and will not reconnect. Not called after `stop()`. */
  onStop: (reason: StreamStopReason) => void;
  createSocket?: (url: string) => WebSocket;
  random?: () => number;
}

/**
 * Live donations of one streamer.
 *
 * Keeps one WebSocket open and restores it after a drop: it reconnects with a capped exponential
 * backoff and resumes from the last event it received, so donations made while the connection was
 * down are delivered once it is back, and none is delivered twice.
 */
export class OxygenDonutsStream {
  private status: StreamStatus = 'idle';
  private socket: WebSocket | null = null;
  /** Position in the event log to resume from. Kept only while the stream is running. */
  private cursor: string | null = null;
  private seenEventIds = new Set<string>();
  private failedAttempts = 0;
  /** When the current run of failures began. Reset together with the backoff. */
  private lostAt: number | null = null;
  private startPromise: Promise<void> | null = null;
  private settleStart: { resolve: () => void; reject: (error: Error) => void } | null = null;
  private readyTimer?: ReturnType<typeof setTimeout>;
  private stableTimer?: ReturnType<typeof setTimeout>;
  private retryTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly options: StreamOptions) {}

  /**
   * Opens the stream. Resolves on the first `connection.ready` and rejects when the first attempt fails
   * (the stream does not retry in that case). Calling it while the stream is running changes nothing.
   */
  start(): Promise<void> {
    if (this.status !== 'idle' && this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = new Promise<void>((resolve, reject) => {
      this.settleStart = { resolve, reject };
    });
    this.openSocket();

    return this.startPromise;
  }

  /**
   * Closes the stream and cancels any pending reconnect.
   */
  stop(): void {
    this.finish(new Error('Oxygen Donuts stream was stopped'));
  }

  private get random(): number {
    return (this.options.random ?? Math.random)();
  }

  private setStatus(status: StreamStatus): void {
    if (this.status === status) return;

    this.status = status;
    this.options.onStatusChange(status);
  }

  private openSocket(): void {
    this.setStatus('connecting');

    let socket: WebSocket;
    try {
      const url = this.options.buildUrl(this.cursor);
      socket = this.options.createSocket ? this.options.createSocket(url) : new WebSocket(url);
    } catch {
      this.handleClose(null, ABNORMAL_CLOSE_CODE);
      return;
    }

    this.socket = socket;
    socket.onmessage = (event) => this.handleMessage(socket, event.data);
    socket.onclose = (event) => this.handleClose(socket, event.code);
    this.readyTimer = setTimeout(() => this.handleClose(socket, ABNORMAL_CLOSE_CODE), READY_TIMEOUT_MS);
  }

  private handleMessage(socket: WebSocket, data: unknown): void {
    if (socket !== this.socket) return;

    const frame = parseFrame(data);
    if (!frame) return;

    if (frame.type === 'connection.ready') {
      this.handleReady(frame);
      return;
    }

    // Delivery is at-least-once, and event ids are opaque: deduplicate by exact id.
    if (typeof frame.id !== 'string' || this.seenEventIds.has(frame.id)) return;
    this.rememberEvent(frame.id);
    this.cursor = frame.id;

    if (frame.type === 'donation.created' && checkIsDonation(frame.data?.donation)) {
      this.options.onDonation(frame.data.donation);
    }
  }

  private handleReady(frame: StreamFrame): void {
    clearTimeout(this.readyTimer);

    // A client that drops before its first event resumes from here and loses nothing.
    if (typeof frame.data?.cursor === 'string') {
      this.cursor = frame.data.cursor;
    }

    this.stableTimer = setTimeout(() => {
      this.failedAttempts = 0;
      this.lostAt = null;
    }, STABLE_CONNECTION_MS);

    this.setStatus('open');
    this.settleStart?.resolve();
    this.settleStart = null;
  }

  private rememberEvent(id: string): void {
    this.seenEventIds.add(id);

    if (this.seenEventIds.size > SEEN_EVENTS_LIMIT) {
      const [oldestId] = this.seenEventIds;
      this.seenEventIds.delete(oldestId);
    }
  }

  private handleClose(socket: WebSocket | null, code: number): void {
    if (socket !== this.socket) return;
    this.releaseSocket();

    const action = resolveCloseAction(code);
    if (action.type === 'unauthorized') {
      this.finish(new Error(`Oxygen Donuts access token is not accepted (${code})`), 'unauthorized');
      return;
    }

    // The first attempt is the streamer's own click: report the failure instead of retrying behind it.
    if (action.type === 'fail' || this.settleStart) {
      this.finish(new Error(`Oxygen Donuts stream is unavailable (${code})`), 'failed');
      return;
    }

    const now = Date.now();
    const lostAt = this.lostAt ?? now;
    const delay = getRetryDelay(action, this.failedAttempts, this.random);
    if (now + delay - lostAt > RECONNECT_WINDOW_MS) {
      this.finish(new Error(`Oxygen Donuts stream is unavailable (${code})`), 'failed');
      return;
    }

    this.lostAt = lostAt;
    this.failedAttempts += 1;
    if (action.dropCursor) {
      this.cursor = null;
    }

    this.setStatus('connecting');
    this.retryTimer = setTimeout(() => this.openSocket(), delay);
  }

  private releaseSocket(): void {
    clearTimeout(this.readyTimer);
    clearTimeout(this.stableTimer);

    const socket = this.socket;
    this.socket = null;
    if (!socket) return;

    socket.onmessage = null;
    socket.onclose = null;
    // A no-op for a socket that is already closed.
    socket.close();
  }

  private finish(error: Error, stopReason?: StreamStopReason): void {
    const settleStart = this.settleStart;

    clearTimeout(this.retryTimer);
    this.releaseSocket();
    this.settleStart = null;
    this.startPromise = null;
    this.cursor = null;
    this.seenEventIds.clear();
    this.failedAttempts = 0;
    this.lostAt = null;
    this.setStatus('idle');

    if (stopReason) {
      this.options.onStop(stopReason);
    }
    settleStart?.reject(error);
  }
}
