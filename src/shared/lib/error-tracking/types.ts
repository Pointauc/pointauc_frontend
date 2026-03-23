export interface ErrorTrackingContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, Record<string, unknown>>;
  fingerprint?: string[];
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
}

export interface ErrorTrackingProvider {
  initialize: () => void;
  captureError: (error: unknown, context?: ErrorTrackingContext) => string | void;
}
