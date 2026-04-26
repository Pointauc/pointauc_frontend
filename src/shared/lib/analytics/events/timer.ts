import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackTimerEdited(payload: AnalyticsEventMap[typeof analyticsEventNames.timerEdited]): void {
  analytics.track(analyticsEventNames.timerEdited, payload);
}
