import { ipcMain, shell, type BrowserWindow } from 'electron';

import { OPEN_EXTERNAL_CHANNEL } from './channels';

const allowedOrigins = new Set<string>();

export const allowOrigin = (origin: string): void => {
  allowedOrigins.add(origin);
};

export const checkIsHttpUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const checkIsAllowedNavigation = (url: string): boolean => {
  try {
    return allowedOrigins.has(new URL(url).origin);
  } catch {
    return false;
  }
};

const openIfExternalHttp = (url: string): boolean => {
  if (checkIsAllowedNavigation(url)) {
    return false;
  }

  if (checkIsHttpUrl(url)) {
    void shell.openExternal(url);
  }

  return true;
};

export const bindNavigation = (win: BrowserWindow): void => {
  win.webContents.on('will-navigate', (event, url) => {
    if (openIfExternalHttp(url)) {
      event.preventDefault();
    }
  });

  win.webContents.on('will-redirect', (event, url) => {
    if (openIfExternalHttp(url)) {
      event.preventDefault();
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!checkIsAllowedNavigation(url) && checkIsHttpUrl(url)) {
      void shell.openExternal(url);
    }

    return { action: 'deny' };
  });
};

export const registerOpenExternalHandler = (): void => {
  ipcMain.handle(OPEN_EXTERNAL_CHANNEL, async (event, url: unknown) => {
    const senderUrl = event.senderFrame?.url;
    if (!senderUrl || !checkIsAllowedNavigation(senderUrl)) {
      throw new Error('Forbidden');
    }

    if (typeof url !== 'string' || !checkIsHttpUrl(url)) {
      throw new Error('Invalid URL');
    }

    await shell.openExternal(url);
  });
};
