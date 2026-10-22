import { useEffect, useMemo, useState } from 'react';

import {
  resolveBannerExperiments,
  ResolveExperimentsOptions,
  subscribeToBannerExperiments,
} from '@domains/promotions/lib/bannerExperiments';
import { ActiveBannerExperiments } from '@domains/promotions/model/experimentTypes';

export const usePromotionExperiments = (
  options?: ResolveExperimentsOptions,
): ActiveBannerExperiments => {
  const distinctId = options?.distinctId;
  const forceFrequencyVariant = options?.forceFrequencyVariant;
  const forceSlotsVariant = options?.forceSlotsVariant;
  const config = options?.config;

  const resolvedOptions = useMemo(
    () => ({ distinctId, forceFrequencyVariant, forceSlotsVariant, config }),
    [distinctId, forceFrequencyVariant, forceSlotsVariant, config],
  );

  const [experiments, setExperiments] = useState<ActiveBannerExperiments>(() =>
    resolveBannerExperiments(resolvedOptions),
  );

  useEffect(() => {
    setExperiments(resolveBannerExperiments(resolvedOptions));

    const unsubscribe = subscribeToBannerExperiments((updated) => {
      setExperiments(updated);
    }, resolvedOptions);

    return () => {
      unsubscribe();
    };
  }, [resolvedOptions]);

  return experiments;
};
