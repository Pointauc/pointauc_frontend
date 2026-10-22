import {
  DEFAULT_BANNER_PLACEMENTS_CONFIG,
  DEFAULT_BASE_URL,
  DEFAULT_GLOBAL_MULTIPLIER,
  DEFAULT_UTM_SOURCE,
} from '@domains/promotions/config/bannerConfig';
import {
  BANNER_CREATIVES_BY_ID,
  BANNER_CREATIVES_BY_SIZE,
} from '@domains/promotions/config/bannerRegistry';
import { isBannersDismissed } from '@domains/promotions/lib/bannerFrequencyStore';
import { buildBannerUrl } from '@domains/promotions/lib/buildBannerUrl';
import { ActiveBannerExperiments } from '@domains/promotions/model/experimentTypes';
import {
  ActiveBanner,
  BannerCreative,
  BannerPage,
  BannerPlacement,
  BannerPlacementConfig,
  BannerSize,
} from '@domains/promotions/model/types';

export interface WeightedCreative {
  creative: BannerCreative;
  weight: number;
}

export const getEligibleWeightedCreatives = (
  config: BannerPlacementConfig,
  options?: {
    creativesBySize?: Record<BannerSize, BannerCreative[]>;
    creativesById?: Record<string, BannerCreative>;
    isIhaqEnabled?: boolean;
  },
): WeightedCreative[] => {
  const creativesBySize = options?.creativesBySize ?? BANNER_CREATIVES_BY_SIZE;
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const isIhaqEnabled = options?.isIhaqEnabled ?? false;

  const result: WeightedCreative[] = [];

  if (config.banners) {
    if (Array.isArray(config.banners)) {
      for (const item of config.banners) {
        const id = typeof item === 'string' ? item : item.bannerId;
        const weight = typeof item === 'string' ? 1 : (item.weight ?? 1);
        const creative = creativesById[id];
        if (creative && weight > 0) {
          if (!isIhaqEnabled || creative.partner !== 'ihaq') {
            result.push({ creative, weight });
          }
        }
      }
    } else if (typeof config.banners === 'object') {
      for (const [id, weight] of Object.entries(config.banners)) {
        const creative = creativesById[id];
        if (creative && typeof weight === 'number' && weight > 0) {
          if (!isIhaqEnabled || creative.partner !== 'ihaq') {
            result.push({ creative, weight });
          }
        }
      }
    }
  } else {
    const pool = creativesBySize[config.size] ?? [];
    for (const creative of pool) {
      if (!isIhaqEnabled || creative.partner !== 'ihaq') {
        result.push({ creative, weight: 1 });
      }
    }
  }

  return result;
};

export const pickWeightedCreative = (
  weightedCreatives: WeightedCreative[],
  random = Math.random,
): BannerCreative | null => {
  if (weightedCreatives.length === 0) {
    return null;
  }

  const totalWeight = weightedCreatives.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  let r = random() * totalWeight;
  for (const { creative, weight } of weightedCreatives) {
    r -= weight;
    if (r <= 0) {
      return creative;
    }
  }

  return weightedCreatives[weightedCreatives.length - 1].creative;
};

export interface SelectPageBannerOptions {
  placementsConfig?: Partial<Record<BannerPlacement, BannerPlacementConfig>>;
  globalMultiplier?: number;
  creativesBySize?: Record<BannerSize, BannerCreative[]>;
  creativesById?: Record<string, BannerCreative>;
  baseUrl?: string;
  utmSource?: string;
  random?: () => number;
  isIhaqEnabled?: boolean;
  experiments?: ActiveBannerExperiments;
  isFrequencyCapped?: boolean;
  isDismissed?: boolean;
}

export const selectPageBanner = (
  page: BannerPage,
  options?: SelectPageBannerOptions,
): ActiveBanner | null => {
  const placementsConfig = options?.placementsConfig ?? DEFAULT_BANNER_PLACEMENTS_CONFIG;
  const globalMultiplier = options?.globalMultiplier ?? DEFAULT_GLOBAL_MULTIPLIER;
  const creativesBySize = options?.creativesBySize ?? BANNER_CREATIVES_BY_SIZE;
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
  const utmSource = options?.utmSource ?? DEFAULT_UTM_SOURCE;
  const random = options?.random ?? Math.random;
  const isIhaqEnabled = options?.isIhaqEnabled ?? false;
  const experiments = options?.experiments;
  const isFrequencyCapped = options?.isFrequencyCapped ?? false;
  const isDismissed = options?.isDismissed ?? isBannersDismissed();

  // If banners are dismissed by the user (24h cooldown), show no banners
  if (isDismissed) {
    return null;
  }

  // If in frequency-capped mode and the cooldown/cap is currently reached, show no banners
  if (experiments?.frequencyVariant === 'frequency_capped' && isFrequencyCapped) {
    return null;
  }

  const candidatePlacements = (
    Object.entries(placementsConfig) as [BannerPlacement, BannerPlacementConfig][]
  ).filter(([placementKey, config]) => {
    if (!config || config.page !== page) {
      return false;
    }

    // Auction slot is only eligible when the slots experiment variant is 'auction_slot'
    if (placementKey === 'auction_integrations' && experiments?.slotsVariant !== 'auction_slot') {
      return false;
    }

    const eligibleCreatives = getEligibleWeightedCreatives(config, {
      creativesBySize,
      creativesById,
      isIhaqEnabled,
    });
    return eligibleCreatives.length > 0;
  });

  const passingPlacements: BannerPlacement[] = [];

  for (const [placementKey, config] of candidatePlacements) {
    const isGuaranteedInFrequencyCapped = experiments?.frequencyVariant === 'frequency_capped';
    const effectiveProbability = isGuaranteedInFrequencyCapped
      ? 1
      : Math.min(1, Math.max(0, config.coefficient * globalMultiplier));

    if (effectiveProbability > 0 && (isGuaranteedInFrequencyCapped || random() < effectiveProbability)) {
      passingPlacements.push(placementKey);
    }
  }

  if (passingPlacements.length === 0) {
    return null;
  }

  const chosenPlacement = passingPlacements[Math.floor(random() * passingPlacements.length)];
  const chosenConfig = placementsConfig[chosenPlacement];
  if (!chosenConfig) {
    return null;
  }

  const eligibleCreatives = getEligibleWeightedCreatives(chosenConfig, {
    creativesBySize,
    creativesById,
    isIhaqEnabled,
  });

  const chosenCreative = pickWeightedCreative(eligibleCreatives, random);
  if (!chosenCreative) {
    return null;
  }

  const url = buildBannerUrl({
    placement: chosenPlacement,
    creative: chosenCreative,
    page,
    baseUrl,
    utmSource,
  });

  return {
    placement: chosenPlacement,
    creative: chosenCreative,
    url,
  };
};
