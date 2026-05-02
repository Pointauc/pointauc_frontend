import { analytics } from '../service';

import { analyticsEventNames, type AnalyticsEventMap } from './catalog';

export const trackAuctionEnded = (payload: AnalyticsEventMap[typeof analyticsEventNames.auctionEnded]): void => {
  analytics.track(analyticsEventNames.auctionEnded, payload);
};
