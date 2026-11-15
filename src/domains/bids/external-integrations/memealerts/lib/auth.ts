import { resolvePublicOrigin } from '@shared/lib/desktop/resolvePublicOrigin';
import { isBrowser } from '@utils/ssr';

export const MEMEALERTS_STATE_STORAGE_KEY = 'memealerts_oauth_state';
export const MEMEALERTS_AUTH_URL = 'https://memealerts.com/oauth/authorize';

export const MEMEALERTS_CLIENT_ID =
  import.meta.env.VITE_MEMEALERTS_CLIENT_ID || 'af28ac4e-550a-46e2-9cc8-849ec4e7ca81';

export const getMemeAlertsRedirectUri = (): string =>
  isBrowser ? `${resolvePublicOrigin()}/memealerts/redirect` : '';

export const createMemeAlertsAuthorizeUrl = (
  clientId = MEMEALERTS_CLIENT_ID,
  redirectUri = getMemeAlertsRedirectUri(),
): string => {
  const state = Math.random().toString(36).substring(2);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(MEMEALERTS_STATE_STORAGE_KEY, state);
  }

  const authUrl = new URL(MEMEALERTS_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'oauth-user-show oauth-donation-subscribe');
  authUrl.searchParams.set('state', state);

  return authUrl.toString();
};
