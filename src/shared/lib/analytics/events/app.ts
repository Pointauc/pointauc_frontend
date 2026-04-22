import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackAppBootstrapped(payload: AnalyticsEventMap[typeof analyticsEventNames.appBootstrapped]): void {
  analytics.track(analyticsEventNames.appBootstrapped, payload);
}
