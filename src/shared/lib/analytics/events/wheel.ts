import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackWheelSpinResult(payload: AnalyticsEventMap[typeof analyticsEventNames.wheelSpinResult]): void {
  analytics.track(analyticsEventNames.wheelSpinResult, payload);
}
