import {
  DEFAULT_BANNER_PLACEMENTS_CONFIG,
  DEFAULT_BASE_URL,
  DEFAULT_GLOBAL_MULTIPLIER,
  DEFAULT_UTM_SOURCE,
} from '@domains/promotions/config/bannerConfig';
import { BANNER_CREATIVES_BY_SIZE } from '@domains/promotions/config/bannerRegistry';
import { buildBannerUrl } from '@domains/promotions/lib/buildBannerUrl';
import {
  ActiveBanner,
  BannerCreative,
  BannerPage,
  BannerPlacement,
  BannerPlacementConfig,
  BannerSize,
} from '@domains/promotions/model/types';

export interface SelectPageBannerOptions {
  placementsConfig?: Record<BannerPlacement, BannerPlacementConfig>;
  globalMultiplier?: number;
  creativesBySize?: Record<BannerSize, BannerCreative[]>;
  baseUrl?: string;
  utmSource?: string;
  random?: () => number;
  isIhaqEnabled?: boolean;
}

export const selectPageBanner = (
  page: BannerPage,
  options?: SelectPageBannerOptions,
): ActiveBanner | null => {
  const placementsConfig = options?.placementsConfig ?? DEFAULT_BANNER_PLACEMENTS_CONFIG;
  const globalMultiplier = options?.globalMultiplier ?? DEFAULT_GLOBAL_MULTIPLIER;
  const creativesBySize = options?.creativesBySize ?? BANNER_CREATIVES_BY_SIZE;
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
  const utmSource = options?.utmSource ?? DEFAULT_UTM_SOURCE;
  const random = options?.random ?? Math.random;
  const isIhaqEnabled = options?.isIhaqEnabled ?? false;

  const candidatePlacements = (
    Object.entries(placementsConfig) as [BannerPlacement, BannerPlacementConfig][]
  ).filter(([_, config]) => {
    if (config.page !== page) {
      return false;
    }
    const pool = creativesBySize[config.size] ?? [];
    const validCreatives = isIhaqEnabled ? pool.filter((c) => c.partner !== 'ihaq') : pool;
    return validCreatives.length > 0;
  });

  const passingPlacements: BannerPlacement[] = [];

  for (const [placementKey, config] of candidatePlacements) {
    const effectiveProbability = Math.min(1, Math.max(0, config.coefficient * globalMultiplier));
    if (effectiveProbability > 0 && random() < effectiveProbability) {
      passingPlacements.push(placementKey);
    }
  }

  if (passingPlacements.length === 0) {
    return null;
  }

  const chosenPlacement = passingPlacements[Math.floor(random() * passingPlacements.length)];
  const chosenConfig = placementsConfig[chosenPlacement];
  const rawCreatives = creativesBySize[chosenConfig.size] ?? [];
  const creatives = isIhaqEnabled ? rawCreatives.filter((c) => c.partner !== 'ihaq') : rawCreatives;

  if (creatives.length === 0) {
    return null;
  }

  const chosenCreative = creatives[Math.floor(random() * creatives.length)];
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
