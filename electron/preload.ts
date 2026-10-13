import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import {
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
    return;
  }

  for (const listener of protocolUrlListeners) {
    listener(url);
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
