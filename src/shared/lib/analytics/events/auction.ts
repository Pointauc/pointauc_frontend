import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export function trackAuctionLotCreated(payload: AnalyticsEventMap[typeof analyticsEventNames.auctionLotCreated]): void {
  analytics.track(analyticsEventNames.auctionLotCreated, payload);
}

export const trackAuctionEnded = (payload: AnalyticsEventMap[typeof analyticsEventNames.auctionEnded]): void => {
  analytics.track(analyticsEventNames.auctionEnded, payload);
};
