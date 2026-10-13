import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import {
  DESKTOP_SYNC_SESSION_CHANNEL,
  OAUTH_CALLBACK_CHANNEL,
  OAUTH_START_CHANNEL,
  OPEN_EXTERNAL_CHANNEL,
  PROTOCOL_URL_CHANNEL,
  RESTART_AND_INSTALL_UPDATE_CHANNEL,
  UPDATE_AVAILABLE_CHANNEL,
  UPDATE_DOWNLOADED_CHANNEL,
} from './channels';

const readCommandLineArgument = (name: string): string => {
  const prefix = `--${name}=`;
  const matchingArgument = process.argv.find((argument) => argument.startsWith(prefix));
  return matchingArgument ? decodeURIComponent(matchingArgument.slice(prefix.length)) : '';
};

export interface DesktopOAuthCallback {
  providerId: string;
  search: string;
}

const protocolUrlListeners = new Set<(url: string) => void>();
const queuedProtocolUrls: string[] = [];

const desktopSyncSessionListeners = new Set<(sessionId: string) => void>();
const queuedDesktopSyncSessions: string[] = [];

const parseDesktopSyncProtocolUrl = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'pointauc:') {
      return undefined;
    }

    const host = parsedUrl.host;
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const isDesktopSync = host === 'desktop-sync' || pathSegments[0] === 'desktop-sync';

    if (!isDesktopSync) {
      return undefined;
    }

    const session = parsedUrl.searchParams.get('session') ?? parsedUrl.searchParams.get('sessionId');
    return session || undefined;
  } catch {
    return undefined;
  }
};

let lastDispatchedSessionId = '';
let lastDispatchedSessionTime = 0;

const emitDesktopSyncSession = (sessionId: string): void => {
  const now = Date.now();
  if (lastDispatchedSessionId === sessionId && now - lastDispatchedSessionTime < 1000) {
    return;
  }

  lastDispatchedSessionId = sessionId;
  lastDispatchedSessionTime = now;

  if (desktopSyncSessionListeners.size === 0) {
    queuedDesktopSyncSessions.push(sessionId);
    return;
  }

  for (const listener of desktopSyncSessionListeners) {
    listener(sessionId);
  }
};

ipcRenderer.on(DESKTOP_SYNC_SESSION_CHANNEL, (_event: IpcRendererEvent, sessionId: unknown) => {
  if (typeof sessionId === 'string' && sessionId) {
    emitDesktopSyncSession(sessionId);
  }
});

const oauthListeners = new Set<(callback: DesktopOAuthCallback) => void>();
const queuedOAuthCallbacks: DesktopOAuthCallback[] = [];

const updateAvailableListeners = new Set<(info: unknown) => void>();
let cachedUpdateAvailableInfo: unknown = undefined;

const updateDownloadedListeners = new Set<(info: unknown) => void>();
let cachedUpdateDownloadedInfo: unknown = undefined;

ipcRenderer.on(PROTOCOL_URL_CHANNEL, (_event: IpcRendererEvent, url: unknown) => {
  if (typeof url !== 'string') {
    return;
  }

  if (protocolUrlListeners.size === 0) {
    queuedProtocolUrls.push(url);
  } else {
    for (const listener of protocolUrlListeners) {
      listener(url);
    }
  }

  const syncSessionId = parseDesktopSyncProtocolUrl(url);
  if (syncSessionId) {
    emitDesktopSyncSession(syncSessionId);
  }
});

const readOAuthCallbackPayload = (payload: unknown): DesktopOAuthCallback | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const providerId = 'providerId' in payload ? payload.providerId : undefined;
  const search = 'search' in payload ? payload.search : undefined;
  if (typeof providerId !== 'string' || typeof search !== 'string') {
    return undefined;
  }

  return { providerId, search };
};

ipcRenderer.on(OAUTH_CALLBACK_CHANNEL, (_event: IpcRendererEvent, payload: unknown) => {
  const callback = readOAuthCallbackPayload(payload);
  if (!callback) {
    return;
  }

  if (oauthListeners.size === 0) {
    queuedOAuthCallbacks.push(callback);
    return;
  }

  for (const listener of oauthListeners) {
    listener(callback);
  }
});

ipcRenderer.on(UPDATE_AVAILABLE_CHANNEL, (_event: IpcRendererEvent, info: unknown) => {
  cachedUpdateAvailableInfo = info;
  for (const listener of updateAvailableListeners) {
    listener(info);
  }
});

ipcRenderer.on(UPDATE_DOWNLOADED_CHANNEL, (_event: IpcRendererEvent, info: unknown) => {
  cachedUpdateDownloadedInfo = info;
  for (const listener of updateDownloadedListeners) {
    listener(info);
  }
});

contextBridge.exposeInMainWorld('pointaucDesktop', {
  isDesktop: true,
  version: readCommandLineArgument('pointauc-desktop-version'),
  publicOrigin: readCommandLineArgument('pointauc-desktop-public-origin'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(OPEN_EXTERNAL_CHANNEL, url),
  startOAuth: (request: { providerId: string; authorizeUrl: string }): Promise<void> =>
    ipcRenderer.invoke(OAUTH_START_CHANNEL, request),
  onProtocolUrl: (listener: (url: string) => void): (() => void) => {
    protocolUrlListeners.add(listener);
    const pendingUrls = queuedProtocolUrls.splice(0, queuedProtocolUrls.length);
    for (const url of pendingUrls) {
      listener(url);
    }

    return () => {
      protocolUrlListeners.delete(listener);
    };
  },
  onOAuthCallback: (listener: (callback: DesktopOAuthCallback) => void): (() => void) => {
    oauthListeners.add(listener);
    const pendingCallbacks = queuedOAuthCallbacks.splice(0, queuedOAuthCallbacks.length);
    for (const callback of pendingCallbacks) {
      listener(callback);
    }

    return () => {
      oauthListeners.delete(listener);
    };
  },
  onDesktopSyncSession: (listener: (sessionId: string) => void): (() => void) => {
    desktopSyncSessionListeners.add(listener);
    const pendingSessions = queuedDesktopSyncSessions.splice(0, queuedDesktopSyncSessions.length);
    for (const sessionId of pendingSessions) {
      listener(sessionId);
    }

    return () => {
      desktopSyncSessionListeners.delete(listener);
    };
  },
  onUpdateAvailable: (listener: (info: unknown) => void): (() => void) => {
    updateAvailableListeners.add(listener);
    if (cachedUpdateAvailableInfo !== undefined) {
      listener(cachedUpdateAvailableInfo);
    }

    return () => {
      updateAvailableListeners.delete(listener);
    };
  },
  onUpdateDownloaded: (listener: (info: unknown) => void): (() => void) => {
    updateDownloadedListeners.add(listener);
    if (cachedUpdateDownloadedInfo !== undefined) {
      listener(cachedUpdateDownloadedInfo);
    }

    return () => {
      updateDownloadedListeners.delete(listener);
    };
  },
  restartAndInstallUpdate: (): Promise<void> => ipcRenderer.invoke(RESTART_AND_INSTALL_UPDATE_CHANNEL),
});
