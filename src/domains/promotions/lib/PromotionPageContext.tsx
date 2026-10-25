import React, { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';

import {
  dismissAllBanners,
  isBannersDismissed,
} from '@domains/promotions/lib/bannerFrequencyStore';
import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { selectIsUserAuthLoading, useIsIhaqEnabled } from '@domains/promotions/lib/useIsIhaqEnabled';
import { ActiveBanner, BannerPage } from '@domains/promotions/model/types';

export interface PromotionPageContextValue {
  activeBanner: ActiveBanner | null;
  page?: BannerPage;
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
  const [isDismissed, setIsDismissed] = useState<boolean>(() => isBannersDismissed());

  const [activeBanner, setActiveBanner] = useState<ActiveBanner | null>(() => {
    if (isAuthLoading) {
      return null;
    }
    return selectPageBanner(page, {
      globalMultiplier: multiplier,
      isIhaqEnabled,
      isDismissed,
    });
  });

  const dismissBanners = useCallback(() => {
    dismissAllBanners();
    setIsDismissed(true);
    setActiveBanner(null);
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (isIhaqEnabled && activeBanner?.creative.partner === 'ihaq') {
      setActiveBanner(null);
      return;
    }

    if (!activeBanner && !isDismissed) {
      const banner = selectPageBanner(page, {
        globalMultiplier: multiplier,
        isIhaqEnabled,
        isDismissed,
      });
      if (banner) {
        setActiveBanner(banner);
      }
    }
  }, [isAuthLoading, isIhaqEnabled, activeBanner, page, multiplier, isDismissed]);

  const contextValue = useMemo(
    () => ({ activeBanner, page, dismissBanners }),
    [activeBanner, page, dismissBanners],
  );

  return <PromotionPageContext.Provider value={contextValue}>{children}</PromotionPageContext.Provider>;
};
