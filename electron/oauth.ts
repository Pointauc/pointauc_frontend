import { BrowserWindow, ipcMain, shell } from 'electron';

import { OAUTH_CALLBACK_CHANNEL, OAUTH_START_CHANNEL } from './channels';
import { readPublicOrigin } from './desktopEnv';
import { checkIsAllowedNavigation } from './navigation';
import { getProtocolWindow } from './protocol';

const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const BLOCKED_BROWSER_PATTERN = /embedded browser|unsupported browser|browser is not supported/i;
const PROVIDER_ID_PATTERN = /^[A-Za-z0-9-]+$/;
const ABORTED_LOAD_CODE = -3;

let authenticationWindow: BrowserWindow | null = null;

const checkIsHttpUrl = (value: string): URL | undefined => {
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    return parsedUrl;
  } catch {
    return undefined;
  }
};

const checkIsCallbackUrl = (url: string, expectedUrl: URL): boolean => {
  const currentUrl = checkIsHttpUrl(url);
  if (!currentUrl) {
    return false;
  }

  return currentUrl.origin === expectedUrl.origin && currentUrl.pathname === expectedUrl.pathname;
};

const readCallbackSearch = (url: string): string => {
  return new URL(url).search.replace(/^\?/, '');
};

const sendOAuthCallback = (providerId: string, search: string): void => {
  const targetWindow = getProtocolWindow();
  if (!targetWindow || targetWindow.isDestroyed()) {
    return;
  }

  targetWindow.webContents.send(OAUTH_CALLBACK_CHANNEL, { providerId, search });
};

const readOAuthRequest = (payload: unknown): { providerId: string; authorizeUrl: string } => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid OAuth request');
  }

  const providerId = 'providerId' in payload ? payload.providerId : undefined;
  const authorizeUrl = 'authorizeUrl' in payload ? payload.authorizeUrl : undefined;
  if (typeof providerId !== 'string' || !PROVIDER_ID_PATTERN.test(providerId)) {
    throw new Error('Invalid provider');
  }

  if (typeof authorizeUrl !== 'string' || !checkIsHttpUrl(authorizeUrl)) {
    throw new Error('Invalid authorize URL');
  }

  return { providerId, authorizeUrl };
};

export const openOAuthWindow = async (providerId: string, authorizeUrl: string, publicOrigin: string): Promise<void> => {
  if (authenticationWindow && !authenticationWindow.isDestroyed()) {
    authenticationWindow.close();
  }

  const authorizeParsed = new URL(authorizeUrl);
  const callbackTargets: URL[] = [];
  const redirectUri = authorizeParsed.searchParams.get('redirect_uri');
  if (redirectUri) {
    const parsedRedirect = checkIsHttpUrl(redirectUri);
    if (parsedRedirect) {
      callbackTargets.push(parsedRedirect);
    }
  }

  const parsedPublicOrigin = checkIsHttpUrl(publicOrigin);
  if (parsedPublicOrigin) {
    callbackTargets.push(new URL(`/${providerId}/redirect`, parsedPublicOrigin.origin));
  }

  const checkIsProviderCallback = (url: string): boolean => {
    return callbackTargets.some((target) => checkIsCallbackUrl(url, target));
  };

  let hasFinished = false;
  let isClosedByUser = false;
  const authWin = new BrowserWindow({
    width: 480,
    height: 720,
    title: 'Pointauc',
    autoHideMenuBar: true,
    parent: getProtocolWindow() ?? undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: 'persist:pointauc',
    },
  });
  authenticationWindow = authWin;
  authWin.webContents.setUserAgent(CHROME_USER_AGENT);

  const fallbackToExternal = (): void => {
    if (hasFinished || isClosedByUser) {
      return;
    }

    hasFinished = true;
    if (!authWin.isDestroyed()) {
      authWin.close();
    }
    void shell.openExternal(authorizeUrl);
  };

  const completeAuthorization = (url: string): void => {
    if (hasFinished) {
      return;
    }

    hasFinished = true;
    sendOAuthCallback(providerId, readCallbackSearch(url));
    if (!authWin.isDestroyed()) {
      authWin.close();
    }
  };

  const interceptNavigation = (event: { preventDefault: () => void }, url: string): void => {
    if (!checkIsProviderCallback(url)) {
      return;
    }

    event.preventDefault();
    completeAuthorization(url);
  };

  authWin.on('closed', () => {
    isClosedByUser = !hasFinished;
    if (authenticationWindow === authWin) {
      authenticationWindow = null;
    }
  });

  authWin.webContents.on('will-navigate', interceptNavigation);
  authWin.webContents.on('will-redirect', interceptNavigation);
  authWin.webContents.on('did-fail-load', (...argumentsList: unknown[]) => {
    const errorCode = argumentsList[1];
    const isMainFrame = argumentsList[4];
    if (isMainFrame !== true || errorCode === ABORTED_LOAD_CODE) {
      return;
    }

    fallbackToExternal();
  });

  authWin.webContents.on('dom-ready', () => {
    if (hasFinished || authWin.isDestroyed()) {
      return;
    }

    void authWin.webContents
      .executeJavaScript('document.body?.innerText ?? ""')
      .then((text: unknown) => {
        if (typeof text === 'string' && BLOCKED_BROWSER_PATTERN.test(text)) {
          fallbackToExternal();
        }
      })
      .catch(() => undefined);
  });

  try {
    await authWin.loadURL(authorizeUrl);
  } catch {
    if (!authWin.isDestroyed()) {
      fallbackToExternal();
    }
  }
};

export const registerOAuthHandler = (): void => {
  ipcMain.handle(OAUTH_START_CHANNEL, async (event, payload: unknown) => {
    const senderUrl = event.senderFrame?.url;
    if (!senderUrl || !checkIsAllowedNavigation(senderUrl)) {
      throw new Error('Forbidden');
    }

    const request = readOAuthRequest(payload);
    await openOAuthWindow(request.providerId, request.authorizeUrl, readPublicOrigin());
  });
};
