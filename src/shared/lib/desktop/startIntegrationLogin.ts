import { getPointaucDesktop } from './checkIsDesktop';

import type { ID } from '@models/integration';

const createRandomUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const startIntegrationLogin = (providerId: ID, authorizeUrl: string): void => {
  const desktop = getPointaucDesktop();

  if (desktop) {
    let finalAuthorizeUrl = authorizeUrl;
    try {
      const parsedUrl = new URL(authorizeUrl);
      const existingState = parsedUrl.searchParams.get('state');

      if (existingState) {
        if (!existingState.startsWith('desktop.')) {
          parsedUrl.searchParams.set('state', `desktop.${existingState}`);
        }
      } else {
        parsedUrl.searchParams.set('state', `desktop.${createRandomUuid()}`);
      }

      if (desktop.publicOrigin) {
        const redirectUriParam = parsedUrl.searchParams.get('redirect_uri');
        if (redirectUriParam) {
          try {
            const redirectUrlObj = new URL(redirectUriParam);
            const publicOriginUrl = new URL(desktop.publicOrigin);
            redirectUrlObj.protocol = publicOriginUrl.protocol;
            redirectUrlObj.host = publicOriginUrl.host;
            redirectUrlObj.port = publicOriginUrl.port;
            parsedUrl.searchParams.set('redirect_uri', redirectUrlObj.toString());
          } catch {
            // Keep original redirect_uri if parsing fails
          }
        }
      }

      finalAuthorizeUrl = parsedUrl.toString();
    } catch (err) {
      console.error('Failed to format desktop authorization URL:', err);
    }

    void desktop.openExternal(finalAuthorizeUrl).catch((err) => {
      console.error(`Failed to open external authorization URL for ${providerId}:`, err);
    });
    return;
  }

  window.open(authorizeUrl, '_self');
};
