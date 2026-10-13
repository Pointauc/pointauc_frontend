import { ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

import {
  RESTART_AND_INSTALL_UPDATE_CHANNEL,
  UPDATE_AVAILABLE_CHANNEL,
  UPDATE_DOWNLOADED_CHANNEL,
} from './channels';
import { checkIsDev, checkIsSmoke } from './desktopEnv';

let isUpdaterInitialized = false;

export const setupAutoUpdater = (win: BrowserWindow): void => {
  if (isUpdaterInitialized) {
    return;
  }
  isUpdaterInitialized = true;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (!win.isDestroyed()) {
      win.webContents.send(UPDATE_AVAILABLE_CHANNEL, info);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (!win.isDestroyed()) {
      win.webContents.send(UPDATE_DOWNLOADED_CHANNEL, info);
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
  });

  ipcMain.handle(RESTART_AND_INSTALL_UPDATE_CHANNEL, () => {
    autoUpdater.quitAndInstall();
  });

  if (checkIsDev() || checkIsSmoke()) {
    return;
  }

  autoUpdater.checkForUpdatesAndNotify().catch((err: unknown) => {
    console.error('Failed to check for updates:', err);
  });
};
