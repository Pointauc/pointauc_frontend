import * as Sentry from '@sentry/react';

import { ErrorTrackingContext, ErrorTrackingProvider } from '../types';

interface SentryCompatibleProviderOptions {
  dsn?: string;
  environment: string;
}

function mapContextToSentryContext(context?: ErrorTrackingContext): Parameters<typeof Sentry.captureException>[1] {
  if (!context) {
    return undefined;
  }

  return {
    tags: context.tags,
    extra: context.extra,
    contexts: context.contexts,
    fingerprint: context.fingerprint,
    level: context.level,
  };
}

export function createSentryCompatibleErrorTrackingProvider(
  options: SentryCompatibleProviderOptions,
): ErrorTrackingProvider {
  let hasInitializedProvider = false;

  return {
    initialize() {
      if (hasInitializedProvider || !options.dsn) {
        return;
      }

      Sentry.init({
        dsn: options.dsn,
        environment: options.environment,
        enabled: true,
        normalizeDepth: 6,
      });

      hasInitializedProvider = true;
    },
    captureError(error, context) {
      if (!options.dsn) {
        return '';
      }

      return Sentry.captureException(error, mapContextToSentryContext(context));
    },
  };
}
