import type { AnalyticsTrackedEvent } from '../events/envelope';

export interface AnalyticsProvider {
  name: string;
  initialize?: () => void | Promise<void>;
  track: (event: AnalyticsTrackedEvent) => void | Promise<void>;
  identify?: (payload: unknown) => void | Promise<void>;
  page?: (payload: unknown) => void | Promise<void>;
  reset?: () => void | Promise<void>;
  flush?: () => void | Promise<void>;
}
