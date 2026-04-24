import { analytics } from './service';

import type { AnalyticsClient } from './service';

export function useAnalytics(): AnalyticsClient {
  return analytics;
}
