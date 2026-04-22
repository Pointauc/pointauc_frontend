export interface AnalyticsContext {
  href?: string;
  pathname?: string;
  locale?: string;
  mode?: string;
  environment?: string;
  isDev?: boolean;
  [key: string]: unknown;
}

export type AnalyticsBaseContext =
  | Partial<AnalyticsContext>
  | (() => Partial<AnalyticsContext>)
  | undefined;
