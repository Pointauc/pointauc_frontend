/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_ORIGIN?: string;
  readonly VITE_ERROR_TRACKING_PROVIDER?: 'glitchtip' | 'sentry';
  readonly VITE_GLITCHTIP_DSN?: string;
  readonly VITE_GLITCHTIP_ENVIRONMENT?: string;
  readonly VITE_KINOPOISK_METADATA_WORKER_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_TMDB_API_KEY?: string;
}
