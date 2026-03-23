import { ErrorTrackingProvider } from '../types';

import { createSentryCompatibleErrorTrackingProvider } from './sentryCompatibleProvider';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const sentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE;

export function createSentryErrorTrackingProvider(): ErrorTrackingProvider {
  return createSentryCompatibleErrorTrackingProvider({
    dsn: sentryDsn,
    environment: sentryEnvironment,
  });
}
