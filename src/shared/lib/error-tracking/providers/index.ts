import { ErrorTrackingProvider } from '../types';

import { createGlitchTipErrorTrackingProvider } from './glitchTipProvider';
import { createSentryErrorTrackingProvider } from './sentryProvider';

const errorTrackingProviderName = import.meta.env.VITE_ERROR_TRACKING_PROVIDER;

function createNoopErrorTrackingProvider(): ErrorTrackingProvider {
  return {
    initialize() {},
    captureError() {
      return '';
    },
  };
}

export function createConfiguredErrorTrackingProvider(): ErrorTrackingProvider {
  switch (errorTrackingProviderName) {
    case 'glitchtip':
      return createGlitchTipErrorTrackingProvider();
    case 'sentry':
      return createSentryErrorTrackingProvider();
    default:
      if (import.meta.env.VITE_GLITCHTIP_DSN) {
        return createGlitchTipErrorTrackingProvider();
      }

      if (import.meta.env.VITE_SENTRY_DSN) {
        return createSentryErrorTrackingProvider();
      }

      return createNoopErrorTrackingProvider();
  }
}
