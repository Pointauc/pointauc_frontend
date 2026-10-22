import React, { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';

import {
  dismissAllBanners,
  getFrequencyCapStatus,
  isBannersDismissed,
} from '@domains/promotions/lib/bannerFrequencyStore';
import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { selectIsUserAuthLoading, useIsIhaqEnabled } from '@domains/promotions/lib/useIsIhaqEnabled';
import { usePromotionExperiments } from '@domains/promotions/lib/usePromotionExperiments';
import { ActiveBannerExperiments, FrequencyCapStatus } from '@domains/promotions/model/experimentTypes';
import { ActiveBanner, BannerPage } from '@domains/promotions/model/types';

export interface PromotionPageContextValue {
  activeBanner: ActiveBanner | null;
  page?: BannerPage;
  experiments?: ActiveBannerExperiments;
  frequencyCapStatus?: FrequencyCapStatus;
  dismissBanners?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PromotionPageContext = createContext<PromotionPageContextValue>({
  activeBanner: null,
});

export interface PromotionPageProviderProps {
  page: BannerPage;
  children: ReactNode;
  multiplier?: number;
}

export const PromotionPageProvider: React.FC<PromotionPageProviderProps> = ({
  page,
  children,
  multiplier,
}) => {
  const isIhaqEnabled = useIsIhaqEnabled();
  const isAuthLoading = useSelector(selectIsUserAuthLoading);
  const experiments = usePromotionExperiments();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => isBannersDismissed());

  const frequencyCapStatus = useMemo(
    () => getFrequencyCapStatus(experiments.frequencyParams),
    [experiments.frequencyParams],
  );

  const prevPageRef = useRef(page);
  const prevMultiplierRef = useRef(multiplier);
  const prevExperimentsRef = useRef(experiments);
  const prevDismissedRef = useRef(isDismissed);
  const hasSelectedRef = useRef(!isAuthLoading);

  const [activeBanner, setActiveBanner] = useState<ActiveBanner | null>(() => {
    if (isAuthLoading) {
      return null;
    }
    return selectPageBanner(page, {
      globalMultiplier: multiplier,
      isIhaqEnabled,
      experiments,
      isFrequencyCapped: frequencyCapStatus.isCapped,
      isDismissed,
    });
  });

  const dismissBanners = useCallback(() => {
    dismissAllBanners();
    setIsDismissed(true);
    setActiveBanner(null);
  }, []);

  if (
    prevPageRef.current !== page ||
    prevMultiplierRef.current !== multiplier ||
    prevExperimentsRef.current.frequencyVariant !== experiments.frequencyVariant ||
    prevExperimentsRef.current.slotsVariant !== experiments.slotsVariant ||
    prevDismissedRef.current !== isDismissed
  ) {
    prevPageRef.current = page;
    prevMultiplierRef.current = multiplier;
    prevExperimentsRef.current = experiments;
    prevDismissedRef.current = isDismissed;
    hasSelectedRef.current = false;
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!hasSelectedRef.current) {
      hasSelectedRef.current = true;
      setActiveBanner(
        selectPageBanner(page, {
          globalMultiplier: multiplier,
          isIhaqEnabled,
          experiments,
          isFrequencyCapped: frequencyCapStatus.isCapped,
          isDismissed,
        }),
      );
      return;
    }

    if (isIhaqEnabled && activeBanner?.creative.partner === 'ihaq') {
      setActiveBanner(null);
    }
  }, [isAuthLoading, isIhaqEnabled, activeBanner, page, multiplier, experiments, frequencyCapStatus.isCapped, isDismissed]);

  const contextValue = useMemo(
    () => ({ activeBanner, page, experiments, frequencyCapStatus, dismissBanners }),
    [activeBanner, page, experiments, frequencyCapStatus, dismissBanners],
  );

  return <PromotionPageContext.Provider value={contextValue}>{children}</PromotionPageContext.Provider>;
};
