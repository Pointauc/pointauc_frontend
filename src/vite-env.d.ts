/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ERROR_TRACKING_PROVIDER?: 'glitchtip' | 'sentry';
  readonly VITE_GLITCHTIP_DSN?: string;
  readonly VITE_GLITCHTIP_ENVIRONMENT?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}
