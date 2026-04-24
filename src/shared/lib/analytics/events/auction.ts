import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackAuctionLotCreated(payload: AnalyticsEventMap[typeof analyticsEventNames.auctionLotCreated]): void {
  analytics.track(analyticsEventNames.auctionLotCreated, payload);
}
