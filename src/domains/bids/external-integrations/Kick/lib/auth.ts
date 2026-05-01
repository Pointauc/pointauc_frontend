import { getQueryValue } from '@utils/url.utils';
import { setKickAuthState } from '@api/kickApi';

export const KICK_CODE_VERIFIER_STORAGE_KEY = 'kick_pkce_verifier';
export const KICK_STATE_STORAGE_KEY = 'kick_oauth_state';

const KICK_AUTH_URL = 'https://id.kick.com/oauth/authorize';
const KICK_SCOPE = 'user:read channel:read channel:rewards:read channel:rewards:write events:subscribe';
const STATE_QUERY_KEY = 'state';

const base64UrlEncode = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
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
  const encodedVerifier = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encodedVerifier);
  return base64UrlEncode(digest);
};

export const createKickAuthorizeUrl = async (clientId: string, redirectUri: string): Promise<string> => {
  const codeVerifier = createRandomValue();
  const state = createRandomValue();
  const codeChallenge = await createChallenge(codeVerifier);

  sessionStorage.setItem(KICK_CODE_VERIFIER_STORAGE_KEY, codeVerifier);
  sessionStorage.setItem(KICK_STATE_STORAGE_KEY, state);
  await setKickAuthState(state);

  const authUrl = new URL(KICK_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', KICK_SCOPE);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  return authUrl.toString();
};

export const getKickRedirectState = (): string => {
  return getQueryValue(window.location.search, STATE_QUERY_KEY) ?? '';
};

export const clearKickAuthSession = (): void => {
  sessionStorage.removeItem(KICK_CODE_VERIFIER_STORAGE_KEY);
  sessionStorage.removeItem(KICK_STATE_STORAGE_KEY);
};
