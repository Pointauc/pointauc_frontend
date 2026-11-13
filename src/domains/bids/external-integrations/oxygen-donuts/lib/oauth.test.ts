import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClientId, getRedirectUri, resolveClientId } from './config';
import {
  CODE_VERIFIER_STORAGE_KEY,
  consumeCodeVerifier,
  createAuthorizeUrl,
  exchangeCodeForToken,
  fetchProfile,
  revokeAccessToken,
  STATE_STORAGE_KEY,
} from './oauth';

import type { PointaucDesktopBridge } from '@shared/lib/desktop/types';

const sha256Base64Url = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('Oxygen Donuts OAuth', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    sessionStorage.clear();
    delete window.pointaucDesktop;
  });

  it('picks the OAuth client from the origin the app runs on', () => {
    expect(resolveClientId('https://pointauc.com')).toBe('pointauc');
    expect(resolveClientId('https://www.pointauc.com')).toBe('pointauc');
    expect(resolveClientId('https://ru.pointauc.com')).toBe('pointauc');
    expect(resolveClientId('https://test.pointauc.com')).toBe('pointauc-dev');
    expect(resolveClientId('http://localhost:3000')).toBe('pointauc-dev');
    expect(resolveClientId('https://pointauc.com.example.org')).toBe('pointauc-dev');
    expect(resolveClientId('https://pointauc.com', ' custom-client ')).toBe('custom-client');

    // The desktop app runs on its own origin but signs in through the public site.
    expect(getClientId()).toBe('pointauc-dev');
    window.pointaucDesktop = { isDesktop: true, publicOrigin: 'https://pointauc.com' } as PointaucDesktopBridge;
    expect(getClientId()).toBe('pointauc');
    expect(getRedirectUri()).toBe('https://pointauc.com/oxygenDonuts/redirect');

    vi.stubEnv('VITE_OXYGEN_DONUTS_CLIENT_ID', 'custom-client');
    expect(getClientId()).toBe('custom-client');
  });

  it('builds an authorize URL with PKCE and a state that are remembered for the redirect', async () => {
    const authorizeUrl = new URL(await createAuthorizeUrl());
    const params = Object.fromEntries(authorizeUrl.searchParams);
    const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY) ?? '';

    expect(`${authorizeUrl.origin}${authorizeUrl.pathname}`).toBe('https://oxygendonuts.com/oauth/authorize');
    expect(params).toEqual({
      response_type: 'code',
      client_id: 'pointauc-dev',
      redirect_uri: `${window.location.origin}/oxygenDonuts/redirect`,
      scope: 'events',
      state: sessionStorage.getItem(STATE_STORAGE_KEY),
      code_challenge: await sha256Base64Url(codeVerifier),
      code_challenge_method: 'S256',
    });
    expect(codeVerifier).toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
    expect(params.state).toMatch(/^[A-Za-z0-9\-_]{43}$/);
    expect(params.state).not.toBe(codeVerifier);

    const nextAuthorizeUrl = new URL(await createAuthorizeUrl());
    expect(nextAuthorizeUrl.searchParams.get('state')).not.toBe(params.state);
    expect(sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY)).not.toBe(codeVerifier);
  });

  it('hands out the verifier only once and only for the state of this login', async () => {
    const getState = async (): Promise<string> => new URL(await createAuthorizeUrl()).searchParams.get('state') ?? '';

    const state = await getState();
    const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY);
    expect(consumeCodeVerifier(`?code=abc&state=${state}`)).toBe(codeVerifier);
    expect(() => consumeCodeVerifier(`?code=abc&state=${state}`)).toThrow();

    // The desktop app gets its own state back with the prefix it was sent with.
    const desktopState = await getState();
    const desktopCodeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY);
    expect(desktopCodeVerifier).not.toBe(codeVerifier);
    expect(consumeCodeVerifier(`?code=abc&state=desktop.${desktopState}`)).toBe(desktopCodeVerifier);

    await getState();
    expect(() => consumeCodeVerifier('?code=abc&state=forged')).toThrow();
    expect(sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STATE_STORAGE_KEY)).toBeNull();

    await getState();
    expect(() => consumeCodeVerifier('?code=abc')).toThrow();
  });

  it('exchanges the code as a form post and reads the profile with the token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: 'oxy_token', token_type: 'Bearer', scope: 'events' }));
    await expect(exchangeCodeForToken('the-code', 'the-verifier')).resolves.toBe('oxy_token');

    const [tokenUrl, tokenRequest] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe('https://oxygendonuts.com/api/oauth/token');
    expect(tokenRequest?.method).toBe('POST');
    expect(Object.fromEntries(tokenRequest?.body as URLSearchParams)).toEqual({
      grant_type: 'authorization_code',
      code: 'the-code',
      redirect_uri: `${window.location.origin}/oxygenDonuts/redirect`,
      client_id: 'pointauc-dev',
      code_verifier: 'the-verifier',
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({ streamer: { id: 'streamer-1', handle: 'vasya', name: 'Vasya' } }));
    await expect(fetchProfile('oxy_token')).resolves.toEqual({ id: 'streamer-1', username: 'Vasya' });
    expect(fetchMock.mock.calls[1]).toEqual([
      'https://api.oxygendonuts.com/v1/me',
      { headers: { Authorization: 'Bearer oxy_token' } },
    ]);

    fetchMock.mockResolvedValueOnce(jsonResponse({ streamer: { id: 'streamer-1', handle: 'vasya', name: null } }));
    await expect(fetchProfile('oxy_token')).resolves.toEqual({ id: 'streamer-1', username: 'vasya' });
  });

  it('fails the login on a rejected code or a malformed answer without leaking the secrets', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'invalid_grant' }, 400));
    await expect(exchangeCodeForToken('the-code', 'the-verifier')).rejects.toThrow(/status 400$/);

    fetchMock.mockResolvedValueOnce(jsonResponse({ token_type: 'Bearer' }));
    await expect(exchangeCodeForToken('the-code', 'the-verifier')).rejects.toThrow();

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: 'service_unavailable' } }, 503));
    await expect(fetchProfile('oxy_token')).rejects.toThrow(/status 503$/);
  });

  it('never fails a logout when the token cannot be revoked', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await revokeAccessToken('oxy_token');

    const [revokeUrl, revokeRequest] = fetchMock.mock.calls[0];
    expect(revokeUrl).toBe('https://oxygendonuts.com/api/oauth/revoke');
    expect(revokeRequest?.method).toBe('POST');
    expect(Object.fromEntries(revokeRequest?.body as URLSearchParams)).toEqual({ token: 'oxy_token' });

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(revokeAccessToken('oxy_token')).resolves.toBeUndefined();
    expect(JSON.stringify(warn.mock.calls)).not.toContain('oxy_token');
  });
});
