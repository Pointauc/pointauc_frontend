import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildStreamUrl,
  getBackoffDelay,
  getRetryDelay,
  OxygenDonutsStream,
  READY_TIMEOUT_MS,
  RECONNECT_WINDOW_MS,
  resolveCloseAction,
  STABLE_CONNECTION_MS,
} from './stream';

import type { OxygenDonutsDonation } from './donation';
import type { CloseAction, StreamStatus, StreamStopReason } from './stream';

const API_ORIGIN = 'https://api.oxygendonuts.com';
const TOKEN = 'oxy_token';

class FakeSocket {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  isClosed = false;

  constructor(readonly url: string) {}

  get cursor(): string | null {
    return new URL(this.url).searchParams.get('cursor');
  }

  close(): void {
    this.isClosed = true;
  }

  receive(frame: object): void {
    this.onmessage?.({ data: JSON.stringify(frame) });
  }

  ready(cursor: string): void {
    this.receive({ type: 'connection.ready', created_at: '2026-11-10T18:40:00Z', data: { cursor } });
  }

  donation(eventId: string, donationId = `donation-${eventId}`): void {
    this.receive({
      id: eventId,
      type: 'donation.created',
      created_at: '2026-11-10T18:42:07Z',
      test: false,
      data: {
        donation: {
          id: donationId,
          donor_name: 'Vasya',
          message: 'Hi',
          amount_usd: '5.00',
          paid_at: '2026-11-10T18:42:01Z',
        },
      },
    });
  }

  drop(code = 1006): void {
    this.onclose?.({ code });
  }
}

const last = <T>(items: T[]): T | undefined => items[items.length - 1];

const createStream = () => {
  const sockets: FakeSocket[] = [];
  const statuses: StreamStatus[] = [];
  const donations: OxygenDonutsDonation[] = [];
  const stops: StreamStopReason[] = [];

  const stream = new OxygenDonutsStream({
    buildUrl: (cursor) => buildStreamUrl(API_ORIGIN, TOKEN, cursor),
    onStatusChange: (status) => statuses.push(status),
    onDonation: (donation) => donations.push(donation),
    onStop: (reason) => stops.push(reason),
    createSocket: (url) => {
      const socket = new FakeSocket(url);
      sockets.push(socket);

      return socket as unknown as WebSocket;
    },
    // With 0.5 the backoff waits 750ms, 1.5s, 3s ... 22.5s.
    random: () => 0.5,
  });

  /** Opens the stream and returns the promise of `start()`, already resolved. */
  const open = async (cursor: string): Promise<void> => {
    const started = stream.start();
    sockets[0].ready(cursor);
    await started;
  };

  return { stream, sockets, statuses, donations, stops, open };
};

describe('Oxygen Donuts stream', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds the stream URL from the API origin, the token and the cursor', () => {
    expect(buildStreamUrl(API_ORIGIN, TOKEN, null)).toBe(
      'wss://api.oxygendonuts.com/v1/stream?token=oxy_token&types=donation.created',
    );
    expect(buildStreamUrl('http://localhost:8787', TOKEN, 'evt_000000000100')).toBe(
      'ws://localhost:8787/v1/stream?token=oxy_token&types=donation.created&cursor=evt_000000000100',
    );
  });

  it('opens live, then resumes after a drop without losing or repeating a donation', async () => {
    const { sockets, statuses, donations, stops, open } = createStream();

    await open('evt_000000000100');
    expect(sockets[0].cursor).toBeNull();
    expect(statuses).toEqual(['connecting', 'open']);

    sockets[0].donation('evt_000000000101');
    sockets[0].donation('evt_000000000101');
    expect(donations.map(({ id }) => id)).toEqual(['donation-evt_000000000101']);

    sockets[0].drop();
    expect(statuses).toEqual(['connecting', 'open', 'connecting']);
    expect(sockets).toHaveLength(1);

    vi.advanceTimersByTime(750);
    expect(sockets[1].cursor).toBe('evt_000000000101');

    // The server replays everything after the cursor; an event seen before the drop is not a new bid.
    sockets[1].ready('evt_000000000101');
    sockets[1].donation('evt_000000000101');
    sockets[1].donation('evt_000000000102');

    expect(donations.map(({ id }) => id)).toEqual(['donation-evt_000000000101', 'donation-evt_000000000102']);
    expect(last(statuses)).toBe('open');
    expect(stops).toEqual([]);
  });

  it('resumes from the cursor of connection.ready when no event arrived before the drop', async () => {
    const { sockets, open } = createStream();

    await open('evt_000000000100');
    sockets[0].drop(1012);
    vi.advanceTimersByTime(10_000);

    expect(sockets[1].cursor).toBe('evt_000000000100');
  });

  it('reconnects without a cursor when the server rejects it', async () => {
    const { sockets, stops, open } = createStream();

    await open('evt_000000000100');
    sockets[0].drop();
    vi.advanceTimersByTime(750);
    expect(sockets[1].cursor).toBe('evt_000000000100');

    sockets[1].drop(4011);
    vi.advanceTimersByTime(1_500);

    expect(sockets[2].cursor).toBeNull();
    expect(stops).toEqual([]);
  });

  it.each([4001, 4003, 4004])('stops for good when the token is rejected with %i', async (code) => {
    const { sockets, statuses, stops, open } = createStream();

    await open('evt_000000000100');
    sockets[0].drop(code);
    vi.advanceTimersByTime(RECONNECT_WINDOW_MS);

    expect(stops).toEqual(['unauthorized']);
    expect(last(statuses)).toBe('idle');
    expect(sockets).toHaveLength(1);
  });

  it('rejects start() and does not retry when the first attempt fails', async () => {
    const dropped = createStream();
    const droppedStart = dropped.stream.start();
    dropped.sockets[0].drop();
    await expect(droppedStart).rejects.toThrow();

    const silent = createStream();
    const silentStart = silent.stream.start();
    vi.advanceTimersByTime(READY_TIMEOUT_MS);
    await expect(silentStart).rejects.toThrow();
    expect(silent.sockets[0].isClosed).toBe(true);

    vi.advanceTimersByTime(RECONNECT_WINDOW_MS);
    for (const { sockets, statuses, stops } of [dropped, silent]) {
      expect(sockets).toHaveLength(1);
      expect(statuses).toEqual(['connecting', 'idle']);
      expect(stops).toEqual(['failed']);
    }
  });

  it('cancels a pending reconnect on stop()', async () => {
    const { stream, sockets, statuses, stops, open } = createStream();

    await open('evt_000000000100');
    sockets[0].drop();
    stream.stop();
    vi.advanceTimersByTime(RECONNECT_WINDOW_MS);

    expect(sockets).toHaveLength(1);
    expect(last(statuses)).toBe('idle');
    expect(stops).toEqual([]);

    // A stream started again is live only: it must not replay what was missed while it was off.
    void stream.start();
    expect(sockets[1].cursor).toBeNull();
  });

  it('gives up when the stream cannot be restored within the reconnect window', async () => {
    const { sockets, statuses, stops, open } = createStream();

    await open('evt_000000000100');
    const lostAt = Date.now();
    sockets[0].drop();

    let handled = 1;
    while (stops.length === 0 && Date.now() - lostAt <= RECONNECT_WINDOW_MS) {
      vi.advanceTimersByTime(250);
      for (; handled < sockets.length; handled += 1) {
        sockets[handled].drop();
      }
    }

    expect(stops).toEqual(['failed']);
    expect(last(statuses)).toBe('idle');
    // 750ms, 1.5s, 3s, 6s, 12s, then 22.5s each: far below the limit of 10 new connections per minute.
    expect(sockets.length).toBeGreaterThan(10);
    expect(sockets.length).toBeLessThan(25);
  });

  it('keeps the backoff until a connection has stayed open for a while', async () => {
    const { sockets, open } = createStream();

    await open('evt_000000000100');
    sockets[0].drop();
    vi.advanceTimersByTime(750);

    // Open, but dropped again right away: the next wait is the second step, not the first one.
    sockets[1].ready('evt_000000000100');
    sockets[1].drop();
    vi.advanceTimersByTime(1_499);
    expect(sockets).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(sockets).toHaveLength(3);

    sockets[2].ready('evt_000000000100');
    vi.advanceTimersByTime(STABLE_CONNECTION_MS);
    sockets[2].drop();
    vi.advanceTimersByTime(750);
    expect(sockets).toHaveLength(4);
  });

  it('waits as the close code asks', () => {
    const retryDelay = (code: number, failedAttempts = 0, random = 0.5): number =>
      getRetryDelay(resolveCloseAction(code) as Extract<CloseAction, { type: 'retry' }>, failedAttempts, random);

    expect([0, 1, 2, 3, 4, 5, 6, 20].map((attempt) => getBackoffDelay(attempt, 1))).toEqual([
      1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000, 30_000,
    ]);
    expect(getBackoffDelay(3, 0)).toBe(4_000);

    expect(retryDelay(1006)).toBe(750);
    expect(retryDelay(4008)).toBe(60_000);
    expect(retryDelay(4503)).toBe(60_000);
    expect(retryDelay(4029)).toBe(10_000);
    expect(retryDelay(4029, 5)).toBe(22_500);
    expect(retryDelay(1013)).toBe(5_000);
    expect(retryDelay(1012, 0, 0)).toBe(1_000);
    expect(retryDelay(1012, 0, 1)).toBe(10_000);

    expect(resolveCloseAction(4030)).toEqual({ type: 'fail' });
    expect(resolveCloseAction(4010)).toEqual({ type: 'retry', dropCursor: true });
  });
});
