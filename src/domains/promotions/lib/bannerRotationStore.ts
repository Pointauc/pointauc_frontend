import { BANNER_CREATIVES_BY_ID } from '@domains/promotions/config/bannerRegistry';
import { BannerCreative } from '@domains/promotions/model/types';
import { isBrowser } from '@utils/ssr.ts';

export const VERTICAL_ROTATION_INDEX_KEY = 'pointauc_promo_vertical_widget_index';
export const VERTICAL_ROTATION_TYPE_KEY = 'pointauc_promo_vertical_type_step';
export const VERTICAL_ROTATION_WIDGET_KEY = 'pointauc_promo_vertical_widget_step';

export const VERTICAL_PROMO_BANNER_IDS = [] as const;

export const VERTICAL_WIDGET_BANNER_IDS = [
  'Memes_260',
  'Word_260',
  'DM_260',
  'Battery_260',
] as const;

export interface WeightedWidgetCreativeId {
  id: string;
  weight: number;
}

export const VERTICAL_WIDGET_CREATIVES_CONFIG: readonly WeightedWidgetCreativeId[] = [
  { id: 'Memes_260', weight: 1 },
  { id: 'Word_260', weight: 1 },
  { id: 'DM_260', weight: 1 },
  { id: 'Battery_260', weight: 1 },
];

export const pickWeightedWidgetBannerId = (
  random: () => number = Math.random,
  weights: readonly WeightedWidgetCreativeId[] = VERTICAL_WIDGET_CREATIVES_CONFIG,
): string => {
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return weights[0]?.id ?? 'Memes_260';
  }

  const r = random() * totalWeight;
  let cumulative = 0;
  for (const { id, weight } of weights) {
    cumulative += weight;
    if (r < cumulative) {
      return id;
    }
  }

  return weights[weights.length - 1].id;
};

let inMemoryIndex: number | null = null;
let sessionVerticalCreative: BannerCreative | null = null;

export const getStoredRotationIndex = (): number | null => {
  if (!isBrowser) {
    return inMemoryIndex;
  }

  try {
    const raw = window.localStorage.getItem(VERTICAL_ROTATION_INDEX_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
    }
    return inMemoryIndex;
  } catch {
    return inMemoryIndex;
  }
};

export const saveRotationIndex = (index: number): void => {
  inMemoryIndex = index;

  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(VERTICAL_ROTATION_INDEX_KEY, index.toString());
  } catch {
    // Ignore storage errors
  }
};

export const getStoredRotationIndices = (
  random: () => number = Math.random,
  weights: readonly WeightedWidgetCreativeId[] = VERTICAL_WIDGET_CREATIVES_CONFIG,
  bannerIds: readonly string[] = VERTICAL_WIDGET_BANNER_IDS,
): { typeIndex: number; widgetIndex: number } => {
  let index = getStoredRotationIndex();
  if (index === null) {
    const chosenId = pickWeightedWidgetBannerId(random, weights);
    const foundIndex = (bannerIds as readonly string[]).indexOf(chosenId);
    index = foundIndex >= 0 ? foundIndex : 0;
  }
  return { typeIndex: index, widgetIndex: index };
};

export const saveRotationIndices = (_typeIndex: number, widgetIndex: number): void => {
  saveRotationIndex(widgetIndex);
};

export const resetVerticalBannerRotation = (): void => {
  inMemoryIndex = null;
  sessionVerticalCreative = null;

  if (isBrowser) {
    try {
      window.localStorage.removeItem(VERTICAL_ROTATION_INDEX_KEY);
      window.localStorage.removeItem(VERTICAL_ROTATION_TYPE_KEY);
      window.localStorage.removeItem(VERTICAL_ROTATION_WIDGET_KEY);
    } catch {
      // Ignore storage errors
    }
  }
};

export interface NextVerticalBannerOptions {
  creativesById?: Record<string, BannerCreative>;
  advance?: boolean;
  forceNew?: boolean;
  random?: () => number;
  weights?: readonly WeightedWidgetCreativeId[];
  bannerIds?: readonly string[];
}

export const getNextVerticalBannerCreative = (
  options?: NextVerticalBannerOptions,
): BannerCreative | null => {
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const advance = options?.advance ?? true;
  const forceNew = options?.forceNew ?? false;
  const random = options?.random ?? Math.random;
  const weights = options?.weights ?? VERTICAL_WIDGET_CREATIVES_CONFIG;
  const bannerIds = options?.bannerIds ?? VERTICAL_WIDGET_BANNER_IDS;

  if (bannerIds.length === 0) {
    return null;
  }

  // During a single page load / view, return the already selected creative so multiple React renders,
  // StrictMode mount/unmount/remount, and state updates do not advance or change the banner.
  if (sessionVerticalCreative && !forceNew) {
    return sessionVerticalCreative;
  }

  const storedIndex = getStoredRotationIndex();

  let currentIndex: number;

  if (storedIndex !== null) {
    // Subsequent visits: rotate continuously from the stored index
    currentIndex = storedIndex % bannerIds.length;
  } else {
    // First visit: randomly select widget banner based on weights
    const chosenId = pickWeightedWidgetBannerId(random, weights);
    const foundIndex = (bannerIds as readonly string[]).indexOf(chosenId);
    currentIndex = foundIndex >= 0 ? foundIndex : 0;
  }

  const chosenId = bannerIds[currentIndex];
  const creative = creativesById[chosenId] ?? null;

  if (advance) {
    const nextIndex = (currentIndex + 1) % bannerIds.length;
    saveRotationIndex(nextIndex);
    sessionVerticalCreative = creative;
  }

  return creative;
};
