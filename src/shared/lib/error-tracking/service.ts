import { isBrowser } from '@utils/ssr';

import { ErrorTrackingContext, ErrorTrackingProvider } from './types';

let activeProvider: ErrorTrackingProvider | null = null;
let hasInitializedGlobalHandlers = false;

function buildUnhandledRejectionError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason;
  }

  const rejectionError = new Error('Unhandled promise rejection') as Error & {
    cause?: unknown;
  };
  rejectionError.cause = reason;

  return rejectionError;
}

function handleWindowError(event: ErrorEvent): void {
  captureError(event.error ?? new Error(event.message), {
    tags: {
      source: 'window-error',
    },
    extra: {
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
    },
  });
}

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  captureError(buildUnhandledRejectionError(event.reason), {
    tags: {
      source: 'unhandled-rejection',
    },
    extra: {
      reason: event.reason,
    },
  });
}

function initGlobalErrorHandlers(): void {
  if (!isBrowser || hasInitializedGlobalHandlers) {
    return;
  }

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  hasInitializedGlobalHandlers = true;
}

/**
 * Initializes the generic error tracking layer and attaches the selected
 * provider that will report captured errors.
 */
export function initErrorTracking(provider: ErrorTrackingProvider): void {
  activeProvider = provider;
  // initGlobalErrorHandlers();
  activeProvider.initialize();
}

export function captureError(error: unknown, context?: ErrorTrackingContext): string {
  const result = activeProvider?.captureError(error, context);

  if (!result) {
    console.error('Captured error', error, context);
  }

  return result ?? '';
}
