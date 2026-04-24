import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackOverlayOpened(payload: AnalyticsEventMap[typeof analyticsEventNames.overlayOpened]): void {
  analytics.track(analyticsEventNames.overlayOpened, payload);
}
