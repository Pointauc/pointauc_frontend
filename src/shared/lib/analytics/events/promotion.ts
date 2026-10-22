import { analytics } from '../service';

import { analyticsEventNames, PromotionBannerEventPayload } from './catalog';

export function trackPromotionBannerImpression(payload: PromotionBannerEventPayload): void {
  analytics.track(analyticsEventNames.promotionBannerImpression, payload);
}

export function trackPromotionBannerClick(payload: PromotionBannerEventPayload): void {
  analytics.track(analyticsEventNames.promotionBannerClick, payload);
}

export function trackPromotionBannerClose(payload: PromotionBannerEventPayload): void {
  analytics.track(analyticsEventNames.promotionBannerClose, payload);
}

export const trackPromotionImpression = trackPromotionBannerImpression;
export const trackPromotionClick = trackPromotionBannerClick;
export const trackPromotionClose = trackPromotionBannerClose;
