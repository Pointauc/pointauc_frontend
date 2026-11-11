import { getApiOrigin, getClientId, getRedirectUri, getWebOrigin } from './config';

import type { OxygenDonutsProfile } from './authStorage';

export const CODE_VERIFIER_STORAGE_KEY = 'oxygenDonuts_pkce_verifier';
export const STATE_STORAGE_KEY = 'oxygenDonuts_oauth_state';

const SCOPE = 'events';
// The desktop app marks its logins with this prefix (see `startIntegrationLogin`).
const DESKTOP_STATE_PREFIX = 'desktop.';
const REVOKE_TIMEOUT_MS = 10_000;

interface TokenResponse {
  access_token?: unknown;
}

interface ProfileResponse {
  streamer?: {
    id?: unknown;
    handle?: unknown;
    name?: unknown;
  };
}

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binaryString = '';
  bytes.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  return window.btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createRandomValue = (): string => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  return base64UrlEncode(randomBytes);
};

const createChallenge = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

  return base64UrlEncode(new Uint8Array(digest));
};

const clearAuthSession = (): void => {
  sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);
  sessionStorage.removeItem(STATE_STORAGE_KEY);
};

export const createAuthorizeUrl = async (): Promise<string> => {
  const codeVerifier = createRandomValue();
  const state = createRandomValue();
  const codeChallenge = await createChallenge(codeVerifier);

  sessionStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier);
  sessionStorage.setItem(STATE_STORAGE_KEY, state);

  const authorizeUrl = new URL(`${getWebOrigin()}/oauth/authorize`);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', getClientId());
  authorizeUrl.searchParams.set('redirect_uri', getRedirectUri());
  authorizeUrl.searchParams.set('scope', SCOPE);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  return authorizeUrl.toString();
};

/**
 * Checks that the redirect answers the login started in this tab and returns its PKCE verifier.
 * The saved state and verifier are single use: they are removed whether the check passes or not.
 *
 * @param search - Query string of the redirect page.
 */
export const consumeCodeVerifier = (search: string): string => {
  const expectedState = sessionStorage.getItem(STATE_STORAGE_KEY) ?? '';
  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY) ?? '';
  clearAuthSession();

  const rawState = new URLSearchParams(search).get('state') ?? '';
  const state = rawState.startsWith(DESKTOP_STATE_PREFIX) ? rawState.slice(DESKTOP_STATE_PREFIX.length) : rawState;

  if (!state || !expectedState || state !== expectedState || !codeVerifier) {
    throw new Error('Invalid Oxygen Donuts OAuth state or verifier');
  }

  return codeVerifier;
};

/**
 * Exchanges the authorization code for an access token.
 * The token has no expiry and no refresh token: it works until the streamer disconnects the app.
 */
export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<string> => {
  const response = await fetch(`${getWebOrigin()}/api/oauth/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: getClientId(),
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`Oxygen Donuts token request failed with status ${response.status}`);
  }

  const { access_token: accessToken } = (await response.json()) as TokenResponse;
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('Oxygen Donuts token response has no access token');
  }

  return accessToken;
};

export const fetchProfile = async (accessToken: string): Promise<OxygenDonutsProfile> => {
  const response = await fetch(`${getApiOrigin()}/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Oxygen Donuts profile request failed with status ${response.status}`);
  }

  const { streamer } = (await response.json()) as ProfileResponse;
  const username = streamer?.name || streamer?.handle;
  if (typeof streamer?.id !== 'string' || typeof username !== 'string') {
    throw new Error('Oxygen Donuts profile response has no streamer');
  }

  return { id: streamer.id, username };
};

/**
 * Best effort: resolves even when the request fails, so it can never block a logout.
 */
export const revokeAccessToken = async (accessToken: string): Promise<void> => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REVOKE_TIMEOUT_MS);

  try {
    await fetch(`${getWebOrigin()}/api/oauth/revoke`, {
      method: 'POST',
      body: new URLSearchParams({ token: accessToken }),
      signal: abortController.signal,
    });
  } catch {
    console.warn('Failed to revoke the Oxygen Donuts access token');
  } finally {
    clearTimeout(timeoutId);
  }
};
