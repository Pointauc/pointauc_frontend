import { useCallback, useContext, useEffect, useRef } from 'react';

import { DEFAULT_BANNER_PLACEMENTS_CONFIG } from '@domains/promotions/config/bannerConfig';
import { PromotionPageContext } from '@domains/promotions/lib/PromotionPageContext';
import { useIsIhaqEnabled } from '@domains/promotions/lib/useIsIhaqEnabled';
import { ActiveBanner, BannerPlacement } from '@domains/promotions/model/types';
import {
  trackPromotionBannerClick,
  trackPromotionBannerImpression,
} from '@shared/lib/analytics/events/promotion';

export interface UsePromotionBannerResult {
  isVisible: boolean;
  banner: ActiveBanner | null;
  handleClick: () => void;
}

export const usePromotionBanner = (placement: BannerPlacement): UsePromotionBannerResult => {
  const { activeBanner, page: contextPage } = useContext(PromotionPageContext);
  const isIhaqEnabled = useIsIhaqEnabled();

  const isAffiliatedDisabled = activeBanner?.creative.partner === 'ihaq' && isIhaqEnabled;
  const isVisible = !isAffiliatedDisabled && activeBanner?.placement === placement;
  const effectiveBanner = isAffiliatedDisabled ? null : activeBanner;
  const lastTrackedBannerIdRef = useRef<string | null>(null);

  const page = contextPage ?? DEFAULT_BANNER_PLACEMENTS_CONFIG[placement]?.page ?? '';

  useEffect(() => {
    if (isVisible && effectiveBanner && lastTrackedBannerIdRef.current !== effectiveBanner.creative.id) {
      lastTrackedBannerIdRef.current = effectiveBanner.creative.id;

      trackPromotionBannerImpression({
        banner_id: effectiveBanner.creative.id,
        placement: effectiveBanner.placement,
        size: effectiveBanner.creative.size,
        campaign: effectiveBanner.creative.campaign,
        target_url: effectiveBanner.url,
        page,
      });
    }
  }, [isVisible, effectiveBanner, page]);

  const handleClick = useCallback(() => {
    if (!isVisible || !effectiveBanner) {
      return;
    }

    trackPromotionBannerClick({
      banner_id: effectiveBanner.creative.id,
      placement: effectiveBanner.placement,
      size: effectiveBanner.creative.size,
      campaign: effectiveBanner.creative.campaign,
      target_url: effectiveBanner.url,
      page,
    });
  }, [isVisible, effectiveBanner, page]);

  return {
    isVisible,
    banner: effectiveBanner,
    handleClick,
  };
};
