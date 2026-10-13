import path from 'node:path';

import { app, type BrowserWindow } from 'electron';

import { PROTOCOL_URL_CHANNEL } from './channels';
import { checkIsSmoke } from './desktopEnv';

const PROTOCOL_SCHEME = 'pointauc';

let targetWindow: BrowserWindow | null = null;
const queuedProtocolUrls: string[] = [];

export const extractProtocolUrl = (argv: readonly string[]): string | undefined => {
  for (const argument of argv) {
    const trimmedValue = argument.trim().replace(/^"+|"+$/g, '');
    if (trimmedValue.startsWith(`${PROTOCOL_SCHEME}://`)) {
      return trimmedValue;
    }
  }

  return undefined;
};

export const registerProtocolClient = (): void => {
  if (checkIsSmoke()) {
    return;
  }

  if (process.defaultApp && process.argv.length >= 2) {
    const applicationPath = process.argv[1];
    if (applicationPath) {
      app.setAsDefaultProtocolClient(PROTOCOL_SCHEME, process.execPath, [path.resolve(applicationPath)]);
    }
    return;
  }

  app.setAsDefaultProtocolClient(PROTOCOL_SCHEME);
};

export const getProtocolWindow = (): BrowserWindow | null => {
  return targetWindow;
};

const flushQueuedProtocolUrls = (): void => {
  if (!targetWindow || targetWindow.isDestroyed() || targetWindow.webContents.isLoading()) {
    return;
  }

  while (queuedProtocolUrls.length > 0) {
    const nextUrl = queuedProtocolUrls.shift();
    if (nextUrl) {
      targetWindow.webContents.send(PROTOCOL_URL_CHANNEL, nextUrl);
    }
  }
};

export const setProtocolWindow = (win: BrowserWindow): void => {
  targetWindow = win;
  win.webContents.on('did-finish-load', flushQueuedProtocolUrls);
  flushQueuedProtocolUrls();
};

export const sendProtocolUrl = (url: string): void => {
  queuedProtocolUrls.push(url);
  flushQueuedProtocolUrls();
};
