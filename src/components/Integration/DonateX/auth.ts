import axios from 'axios';

import { IntegrationDataDto } from '@models/user.model.ts';

export const BASE_URL = 'https://donatex.gg/api';
export const CLIENT_ID = import.meta.env.VITE_DONATEX_CLIENT_ID ?? 'DONATEX CLIENT ID NOT FOUND';
export const REDIRECT_URI = `${window.location.origin}/donatex/redirect`;
export const PKCE_VERIFIER_KEY = 'donatex_pkce_verifier';
const PROFILE_STORAGE_KEY = 'donatex_profile';
const ACCESS_TOKEN_KEY = 'donatex_authToken';
const REFRESH_TOKEN_KEY = 'donatex_refreshToken';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

export interface DonateXProfile {
  id: string;
  username: string;
}

export interface DonateXDonation {
  id: string;
  username: string;
  message: string;
  amount: number;
  amountInRub: number;
  currency: string;
  timestamp: string;
}

const base64UrlEncode = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const createVerifier = (): string => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  return base64UrlEncode(randomBytes);
};

const createChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return base64UrlEncode(digest);
};

export const storeTokens = ({ access_token, refresh_token }: TokenResponse): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }
};

export const loadTokens = () => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) ?? '',
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ?? '',
});

export const storeProfile = (profile: DonateXProfile): void => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const loadProfile = (): DonateXProfile | null => {
  const data = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as DonateXProfile;
  } catch {
    return null;
  }
};

export const getAuthHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const fetchProfile = async (accessToken: string): Promise<DonateXProfile> => {
  const { data } = await axios.get<DonateXProfile>(`${BASE_URL}/v1/user/me`, {
    headers: getAuthHeaders(accessToken),
  });

  return data;
};

export const exchangeCodeForToken = async (code: string, verifier: string): Promise<TokenResponse> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('client_id', CLIENT_ID);
  params.append('code_verifier', verifier);

  const { data } = await axios.post<TokenResponse>(`${BASE_URL}/connect/token`, params);

  return data;
};

export const refreshToken = async (refreshTokenValue: string): Promise<TokenResponse | null> => {
  if (!refreshTokenValue) return null;

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshTokenValue);
  params.append('client_id', CLIENT_ID);

  const { data } = await axios.post<TokenResponse>(`${BASE_URL}/connect/token`, params);

  return data;
};

export const parseJwt = (token: string): { exp?: number } | null => {
  try {
    return JSON.parse(window.atob(token.split('.')[1]));
  } catch (e) {
    console.warn('Failed to parse token', e);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const parsed = parseJwt(token);
  if (!parsed?.exp) return false;

  return parsed.exp * 1000 < Date.now() + 60 * 1000;
};

export const buildAuthorizeUrl = async (): Promise<string> => {
  const verifier = createVerifier();
  const challenge = await createChallenge(verifier);
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);

  const url = new URL(`${BASE_URL}/connect/authorize`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid offline_access donations.read donations.subscribe user.read');
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  return url.toString();
};

export const validateDonateX = (): boolean => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getDonateXAuthData = (): IntegrationDataDto | undefined => {
  const profile = loadProfile();
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';

  if (!profile || !accessToken) return undefined;

  return {
    ...profile,
    accessToken,
    isValid: true,
  };
};

export const ensureFreshAccessToken = async (): Promise<string | null> => {
  const { accessToken, refreshToken: storedRefresh } = loadTokens();
  if (!accessToken) return null;

  if (!isTokenExpired(accessToken)) return accessToken;

  try {
    const refreshed = await refreshToken(storedRefresh);
    if (!refreshed?.access_token) return null;

    storeTokens(refreshed);

    return refreshed.access_token;
  } catch (e) {
    console.warn('Failed to refresh DonateX token', e);
    return null;
  }
};
