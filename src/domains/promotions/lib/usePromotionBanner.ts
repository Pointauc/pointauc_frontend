import { useCallback, useContext, useEffect, useRef } from 'react';

import { DEFAULT_BANNER_PLACEMENTS_CONFIG } from '@domains/promotions/config/bannerConfig';
import { recordBannerImpression } from '@domains/promotions/lib/bannerFrequencyStore';
import { PromotionPageContext } from '@domains/promotions/lib/PromotionPageContext';
import { useIsIhaqEnabled } from '@domains/promotions/lib/useIsIhaqEnabled';
import { ActiveBannerExperiments } from '@domains/promotions/model/experimentTypes';
import { ActiveBanner, BannerPlacement } from '@domains/promotions/model/types';
import {
  trackPromotionBannerClick,
  trackPromotionBannerClose,
  trackPromotionBannerImpression,
} from '@shared/lib/analytics/events/promotion';

export interface UsePromotionBannerResult {
  isVisible: boolean;
  banner: ActiveBanner | null;
  handleClick: () => void;
  handleClose: () => void;
  experiments?: ActiveBannerExperiments;
}

export const usePromotionBanner = (placement: BannerPlacement): UsePromotionBannerResult => {
  const { activeBanner, page: contextPage, experiments, dismissBanners } = useContext(PromotionPageContext);
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
        experiment_frequency_variant: experiments?.frequencyVariant,
        experiment_slots_variant: experiments?.slotsVariant,
      });

      if (experiments?.frequencyVariant === 'frequency_capped') {
        recordBannerImpression(Date.now(), experiments.frequencyParams);
      }
    }
  }, [isVisible, effectiveBanner, page, experiments]);

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
      experiment_frequency_variant: experiments?.frequencyVariant,
      experiment_slots_variant: experiments?.slotsVariant,
    });
  }, [isVisible, effectiveBanner, page, experiments]);

  const handleClose = useCallback(() => {
    if (effectiveBanner) {
      trackPromotionBannerClose({
        banner_id: effectiveBanner.creative.id,
        placement: effectiveBanner.placement,
        size: effectiveBanner.creative.size,
        campaign: effectiveBanner.creative.campaign,
        target_url: effectiveBanner.url,
        page,
        experiment_frequency_variant: experiments?.frequencyVariant,
        experiment_slots_variant: experiments?.slotsVariant,
      });
    }

    dismissBanners?.();
  }, [dismissBanners, effectiveBanner, page, experiments]);

  return {
    isVisible,
    banner: effectiveBanner,
    handleClick,
    handleClose,
    experiments,
  };
};
