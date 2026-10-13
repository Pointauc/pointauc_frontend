import fs from 'node:fs';
import path from 'node:path';

import { app, BrowserWindow, Menu, MenuItem, session } from 'electron';

import { checkIsDev } from './desktopEnv';
import { allowOrigin, bindNavigation } from './navigation';
import { setProtocolWindow } from './protocol';
import { bindWindowBounds, resolveWindowBounds } from './windowBounds';

export interface CreateWindowOptions {
  loadUrl: string;
  publicOrigin: string;
  version: string;
  isSmoke: boolean;
}

const resolveIconPath = (): string | undefined => {
  const candidatePaths = [
    path.join(app.getAppPath(), 'icon.ico'),
    path.join(app.getAppPath(), 'electron', 'icon.ico'),
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(app.getAppPath(), 'public', 'favicon_new.ico'),
    path.join(app.getAppPath(), 'dist', 'favicon_new.ico'),
    path.join(__dirname, '..', '..', 'public', 'favicon_new.ico'),
  ];

  return candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));
};

export const createMainWindow = (options: CreateWindowOptions): BrowserWindow => {
  const boundsFilePath = path.join(app.getPath('userData'), 'window-bounds.json');
  const bounds = options.isSmoke
    ? { width: 800, height: 600, isMaximized: false }
    : resolveWindowBounds(boundsFilePath);
  const iconPath = resolveIconPath();
  const origin = new URL(options.loadUrl).origin;
  allowOrigin(origin);

  const win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    title: 'Pointauc',
    icon: iconPath,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: [
        `--pointauc-desktop-version=${encodeURIComponent(options.version)}`,
        `--pointauc-desktop-public-origin=${encodeURIComponent(options.publicOrigin)}`,
      ],
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      session: session.fromPartition('persist:pointauc'),
    },
  });

  win.setMenuBarVisibility(false);

  if (!options.isSmoke) {
    bindWindowBounds(win, boundsFilePath);
    win.once('ready-to-show', () => {
      if (bounds.isMaximized) {
        win.maximize();
      }
      win.show();
    });
  }

  let hasInitiatedClose = false;
  win.on('close', async (event) => {
    if (hasInitiatedClose || options.isSmoke) {
      return;
    }

    event.preventDefault();
    hasInitiatedClose = true;

    try {
      await Promise.race([
        win.webContents.executeJavaScript(
          'window.__pointauc_perform_final_save?.() || Promise.resolve()',
        ),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (saveError) {
      console.error('Final save error during shutdown:', saveError);
    } finally {
      win.destroy();
      app.quit();
    }
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') {
      return;
    }

    const isToggleDevTools =
      input.key === 'F12' ||
      ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i');

    if (isToggleDevTools) {
      win.webContents.toggleDevTools();
      event.preventDefault();
      return;
    }

    const isReload =
      (input.key === 'F5' && !input.control && !input.shift) ||
      ((input.control || input.meta) && !input.shift && input.key.toLowerCase() === 'r');

    if (isReload) {
      win.webContents.reload();
      event.preventDefault();
    }
  });

  if (checkIsDev()) {
    win.webContents.on('context-menu', (_event, params) => {
      const contextMenu = new Menu();
      contextMenu.append(
        new MenuItem({
          label: 'Inspect Element',
          click: () => win.webContents.inspectElement(params.x, params.y),
        }),
      );
      contextMenu.popup();
    });
  }

  bindNavigation(win);
  setProtocolWindow(win);
  void win.loadURL(options.loadUrl);
  return win;
};
