import { ErrorTrackingProvider } from '../types';

import { createSentryCompatibleErrorTrackingProvider } from './sentryCompatibleProvider';

const glitchTipDsn = import.meta.env.VITE_GLITCHTIP_DSN;
const glitchTipEnvironment = import.meta.env.VITE_GLITCHTIP_ENVIRONMENT ?? import.meta.env.MODE;

export function createGlitchTipErrorTrackingProvider(): ErrorTrackingProvider {
  return createSentryCompatibleErrorTrackingProvider({
    dsn: glitchTipDsn,
    environment: glitchTipEnvironment,
  });
}
