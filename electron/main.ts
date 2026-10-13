import { app, dialog, type BrowserWindow } from 'electron';

import { createMainWindow } from './createWindow';
import { checkIsDev, checkIsSmoke, readBackendOrigin, readPublicOrigin } from './desktopEnv';
import { requestLocalStatus, startLocalServer, type LocalServerHandle } from './localServer';
import { registerOpenExternalHandler } from './navigation';
import { registerOAuthHandler } from './oauth';
import { extractProtocolUrl, getProtocolWindow, registerProtocolClient, sendProtocolUrl } from './protocol';
import { resolveStaticRoot } from './staticRoot';
import { setupAutoUpdater } from './updater';

const DEV_RENDERER_URL = 'http://localhost:3000';
const SMOKE_TIMEOUT_MILLISECONDS = 60000;

const handleStartupFailure = (message: string): void => {
  console.error(message);
  if (!checkIsSmoke()) {
    dialog.showErrorBox('Pointauc', message);
  }
  app.exit(1);
};

const bindSmokeTesting = (win: BrowserWindow): void => {
  const timeoutId = setTimeout(() => {
    console.error('DESKTOP_SMOKE_TIMEOUT');
    app.exit(1);
  }, SMOKE_TIMEOUT_MILLISECONDS);

  const finishSmokeTest = (exitCode: number): void => {
    clearTimeout(timeoutId);
    app.exit(exitCode);
  };

  win.webContents.once('did-fail-load', (_event, errorCode, errorDescription, _url, isMainFrame) => {
    if (!isMainFrame) {
      return;
    }

    console.error(`DESKTOP_SMOKE_FAIL ${errorCode} ${errorDescription}`);
    finishSmokeTest(1);
  });

  win.webContents.once('did-finish-load', () => {
    void win.webContents
      .executeJavaScript(
        `({
          isDesktop: window.pointaucDesktop?.isDesktop === true,
          hasVersion: typeof window.pointaucDesktop?.version === 'string' && window.pointaucDesktop.version.length > 0,
          publicOrigin: window.pointaucDesktop?.publicOrigin ?? '',
          openExternal: typeof window.pointaucDesktop?.openExternal === 'function',
          onProtocolUrl: typeof window.pointaucDesktop?.onProtocolUrl === 'function',
          onUpdateAvailable: typeof window.pointaucDesktop?.onUpdateAvailable === 'function',
          onUpdateDownloaded: typeof window.pointaucDesktop?.onUpdateDownloaded === 'function',
          restartAndInstallUpdate: typeof window.pointaucDesktop?.restartAndInstallUpdate === 'function'
        })`,
      )
      .then((bridge: {
        isDesktop?: boolean;
        hasVersion?: boolean;
        publicOrigin?: string;
        openExternal?: boolean;
        onProtocolUrl?: boolean;
        onUpdateAvailable?: boolean;
        onUpdateDownloaded?: boolean;
        restartAndInstallUpdate?: boolean;
      }) => {
        console.log(`DESKTOP_SMOKE_BRIDGE ${JSON.stringify(bridge)}`);
        const isSuccessful =
          bridge.isDesktop === true &&
          bridge.hasVersion === true &&
          bridge.openExternal === true &&
          bridge.onProtocolUrl === true &&
          bridge.onUpdateAvailable === true &&
          bridge.onUpdateDownloaded === true &&
          bridge.restartAndInstallUpdate === true &&
          typeof bridge.publicOrigin === 'string' &&
          bridge.publicOrigin.length > 0;

        console.log(isSuccessful ? 'DESKTOP_SMOKE_OK' : 'DESKTOP_SMOKE_FAIL');
        finishSmokeTest(isSuccessful ? 0 : 1);
      })
      .catch((err: unknown) => {
        console.error('DESKTOP_SMOKE_FAIL', err);
        finishSmokeTest(1);
      });
  });
};

const startApplication = async (): Promise<void> => {
  let loadUrl = DEV_RENDERER_URL;
  const publicOrigin = readPublicOrigin();
  const backendOrigin = readBackendOrigin();
  let localServer: LocalServerHandle | undefined;

  if (!checkIsDev() || checkIsSmoke()) {
    localServer = await startLocalServer({
      staticRoot: resolveStaticRoot(),
      backendOrigin,
    });
    loadUrl = localServer.origin;

    if (checkIsSmoke()) {
      const statusCode = await requestLocalStatus(localServer.origin, '/');
      console.log(`DESKTOP_SMOKE_ROOT_STATUS ${statusCode}`);
      if (statusCode !== 200) {
        throw new Error(`Smoke request / failed with status code ${statusCode}`);
      }
    }
  }

  const win = createMainWindow({
    loadUrl,
    publicOrigin,
    version: app.getVersion(),
    isSmoke: checkIsSmoke(),
  });

  setupAutoUpdater(win);

  if (checkIsSmoke()) {
    bindSmokeTesting(win);
  }

  const initialProtocolUrl = extractProtocolUrl(process.argv);
  if (initialProtocolUrl) {
    sendProtocolUrl(initialProtocolUrl);
  }

  app.on('before-quit', () => {
    void localServer?.close();
  });
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.exit(0);
} else {
  app.setAppUserModelId('com.pointauc.desktop');
  registerProtocolClient();
  registerOpenExternalHandler();
  registerOAuthHandler();

  app.on('second-instance', (_event, argv) => {
    const protocolUrl = extractProtocolUrl(argv);
    if (protocolUrl) {
      sendProtocolUrl(protocolUrl);
    }

    const targetWindow = getProtocolWindow();
    if (!targetWindow || targetWindow.isDestroyed()) {
      return;
    }

    if (targetWindow.isMinimized()) {
      targetWindow.restore();
    }
    targetWindow.focus();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.whenReady().then(() => {
    startApplication().catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start Pointauc';
      handleStartupFailure(errorMessage);
    });
  });
}
