import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackAuctionHistorySyncConflict(
  payload: AnalyticsEventMap[typeof analyticsEventNames.auctionHistorySyncConflict],
): void {
  analytics.track(analyticsEventNames.auctionHistorySyncConflict, payload);
}
