import React, { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { selectIsUserAuthLoading, useIsIhaqEnabled } from '@domains/promotions/lib/useIsIhaqEnabled';
import { ActiveBanner, BannerPage } from '@domains/promotions/model/types';

export interface PromotionPageContextValue {
  activeBanner: ActiveBanner | null;
  page?: BannerPage;
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

  const prevPageRef = useRef(page);
  const prevMultiplierRef = useRef(multiplier);
  const hasSelectedRef = useRef(!isAuthLoading);

  const [activeBanner, setActiveBanner] = useState<ActiveBanner | null>(() => {
    if (isAuthLoading) {
      return null;
    }
    return selectPageBanner(page, { globalMultiplier: multiplier, isIhaqEnabled });
  });

  if (prevPageRef.current !== page || prevMultiplierRef.current !== multiplier) {
    prevPageRef.current = page;
    prevMultiplierRef.current = multiplier;
    hasSelectedRef.current = false;
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!hasSelectedRef.current) {
      hasSelectedRef.current = true;
      setActiveBanner(selectPageBanner(page, { globalMultiplier: multiplier, isIhaqEnabled }));
      return;
    }

    if (isIhaqEnabled && activeBanner?.creative.partner === 'ihaq') {
      setActiveBanner(null);
    }
  }, [isAuthLoading, isIhaqEnabled, activeBanner, page, multiplier]);

  const contextValue = useMemo(() => ({ activeBanner, page }), [activeBanner, page]);

  return <PromotionPageContext.Provider value={contextValue}>{children}</PromotionPageContext.Provider>;
};
