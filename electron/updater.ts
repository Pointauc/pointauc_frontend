import { ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

import {
  RESTART_AND_INSTALL_UPDATE_CHANNEL,
  UPDATE_AVAILABLE_CHANNEL,
  UPDATE_DOWNLOADED_CHANNEL,
} from './channels';
import { checkIsDev, checkIsSmoke } from './desktopEnv';
import {
  applyPortableAsarUpdate,
  checkForPortableUpdates,
  checkIsPortable,
} from './portableUpdater';

let isUpdaterInitialized = false;

export const setupAutoUpdater = (win: BrowserWindow): void => {
  if (isUpdaterInitialized) {
    return;
  }
  isUpdaterInitialized = true;

  const isPortable = checkIsPortable();

  if (isPortable) {
    ipcMain.handle(RESTART_AND_INSTALL_UPDATE_CHANNEL, () => {
      const isApplied = applyPortableAsarUpdate();
      if (!isApplied) {
        console.error('Failed to apply portable update: new asar not found');
      }
    });

    if (checkIsDev() || checkIsSmoke()) {
      return;
    }

    checkForPortableUpdates(win).catch((err: unknown) => {
      console.error('Failed to check for portable updates:', err);
    });
    return;
  }

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
