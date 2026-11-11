import { resolvePublicOrigin } from '@shared/lib/desktop/resolvePublicOrigin';

export const OXYGEN_DONUTS_ID = 'oxygenDonuts';

const DEFAULT_WEB_ORIGIN = 'https://oxygendonuts.com';
const DEFAULT_API_ORIGIN = 'https://api.oxygendonuts.com';

/** OAuth client registered for the production site. */
const PRODUCTION_CLIENT_ID = 'pointauc';
/** OAuth client registered for local development and staging. Its consent screen is marked as a test app. */
const DEVELOPMENT_CLIENT_ID = 'pointauc-dev';
const PRODUCTION_ORIGINS = ['https://pointauc.com', 'https://www.pointauc.com', 'https://ru.pointauc.com'];

const normalizeOrigin = (value: string | undefined, fallback: string): string =>
  (value?.trim() || fallback).replace(/\/+$/, '');

export const getWebOrigin = (): string =>
  normalizeOrigin(import.meta.env.VITE_OXYGEN_DONUTS_WEB_ORIGIN, DEFAULT_WEB_ORIGIN);

export const getApiOrigin = (): string =>
  normalizeOrigin(import.meta.env.VITE_OXYGEN_DONUTS_API_ORIGIN, DEFAULT_API_ORIGIN);

/**
 * Both clients are public (PKCE, no secret), so the right one is picked from the origin the app runs on
 * and no configuration is needed. `clientIdOverride` is only for testing against another OAuth client.
 */
export const resolveClientId = (publicOrigin: string, clientIdOverride?: string): string => {
  const override = clientIdOverride?.trim();
  if (override) {
    return override;
  }

  return PRODUCTION_ORIGINS.includes(publicOrigin) ? PRODUCTION_CLIENT_ID : DEVELOPMENT_CLIENT_ID;
};

export const getClientId = (): string =>
  resolveClientId(resolvePublicOrigin(), import.meta.env.VITE_OXYGEN_DONUTS_CLIENT_ID);

export const getRedirectUri = (): string => `${resolvePublicOrigin()}/${OXYGEN_DONUTS_ID}/redirect`;
