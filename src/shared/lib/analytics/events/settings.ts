import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackSettingsSaved(payload: AnalyticsEventMap[typeof analyticsEventNames.settingsSaved]): void {
  analytics.track(analyticsEventNames.settingsSaved, payload);
}
