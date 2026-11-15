import { BANNER_CREATIVES_BY_ID } from '@domains/promotions/config/bannerRegistry';
import { BannerCreative } from '@domains/promotions/model/types';
import { isBrowser } from '@utils/ssr.ts';

export const VERTICAL_ROTATION_TYPE_KEY = 'pointauc_promo_vertical_type_step';
export const VERTICAL_ROTATION_WIDGET_KEY = 'pointauc_promo_vertical_widget_step';

export const VERTICAL_PROMO_BANNER_IDS = ['Point_260'] as const;
export const VERTICAL_WIDGET_BANNER_IDS = ['Memes_260', 'Word_260', 'DM_260'] as const;

export interface WeightedWidgetCreativeId {
  id: string;
  weight: number;
}

export const VERTICAL_WIDGET_CREATIVES_CONFIG: readonly WeightedWidgetCreativeId[] = [
  { id: 'Memes_260', weight: 80 },
  { id: 'Word_260', weight: 10 },
  { id: 'DM_260', weight: 10 },
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

let inMemoryTypeIndex: number | null = null;
let inMemoryWidgetIndex: number | null = null;
let sessionVerticalCreative: BannerCreative | null = null;

export const getStoredRotationIndices = (
  random: () => number = Math.random,
): { typeIndex: number; widgetIndex: number } => {
  if (!isBrowser) {
    if (inMemoryTypeIndex === null || inMemoryWidgetIndex === null) {
      const isFirstPromo = random() < 0.5;
      inMemoryTypeIndex = isFirstPromo ? 0 : 1;
      inMemoryWidgetIndex = 0;
    }
    return { typeIndex: inMemoryTypeIndex, widgetIndex: inMemoryWidgetIndex };
  }

  try {
    const rawType = window.localStorage.getItem(VERTICAL_ROTATION_TYPE_KEY);
    const rawWidget = window.localStorage.getItem(VERTICAL_ROTATION_WIDGET_KEY);

    if (rawType !== null) {
      const typeIndex = Math.max(0, parseInt(rawType, 10) || 0);
      const widgetIndex = rawWidget !== null ? Math.max(0, parseInt(rawWidget, 10) || 0) : 0;
      return { typeIndex, widgetIndex };
    }

    if (inMemoryTypeIndex !== null && inMemoryWidgetIndex !== null) {
      return { typeIndex: inMemoryTypeIndex, widgetIndex: inMemoryWidgetIndex };
    }

    // First appearance: 50/50 between promo (typeIndex 0) and widget (typeIndex 1).
    const isFirstPromo = random() < 0.5;
    const typeIndex = isFirstPromo ? 0 : 1;
    const widgetIndex = 0;

    inMemoryTypeIndex = typeIndex;
    inMemoryWidgetIndex = widgetIndex;

    return { typeIndex, widgetIndex };
  } catch {
    if (inMemoryTypeIndex === null || inMemoryWidgetIndex === null) {
      const isFirstPromo = random() < 0.5;
      inMemoryTypeIndex = isFirstPromo ? 0 : 1;
      inMemoryWidgetIndex = 0;
    }
    return { typeIndex: inMemoryTypeIndex, widgetIndex: inMemoryWidgetIndex };
  }
};

export const saveRotationIndices = (typeIndex: number, widgetIndex: number): void => {
  inMemoryTypeIndex = typeIndex;
  inMemoryWidgetIndex = widgetIndex;

  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(VERTICAL_ROTATION_TYPE_KEY, typeIndex.toString());
    window.localStorage.setItem(VERTICAL_ROTATION_WIDGET_KEY, widgetIndex.toString());
  } catch {
    // Ignore storage errors
  }
};

export const resetVerticalBannerRotation = (): void => {
  inMemoryTypeIndex = null;
  inMemoryWidgetIndex = null;
  sessionVerticalCreative = null;

  if (isBrowser) {
    try {
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
}

export const getNextVerticalBannerCreative = (
  options?: NextVerticalBannerOptions,
): BannerCreative | null => {
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const advance = options?.advance ?? true;
  const forceNew = options?.forceNew ?? false;
  const random = options?.random ?? Math.random;

  // During a single page load / view, return the already selected creative so multiple React renders,
  // StrictMode mount/unmount/remount, and state updates do not advance or change the banner.
  if (sessionVerticalCreative && !forceNew) {
    return sessionVerticalCreative;
  }

  const { typeIndex, widgetIndex } = getStoredRotationIndices(random);

  // 1. Promocode banner (even step: 0, 2, 4...) -> 2. Widget banner (odd step: 1, 3, 5...)
  const isPromo = typeIndex % 2 === 0;

  let chosenId: string;
  let nextWidgetIndex = widgetIndex;

  if (isPromo) {
    const promoIndexInList = Math.floor(typeIndex / 2) % VERTICAL_PROMO_BANNER_IDS.length;
    chosenId = VERTICAL_PROMO_BANNER_IDS[promoIndexInList];
  } else {
    chosenId = pickWeightedWidgetBannerId(random);
    const widgetIndexInList = (VERTICAL_WIDGET_BANNER_IDS as readonly string[]).indexOf(chosenId);
    nextWidgetIndex = widgetIndexInList >= 0 ? widgetIndexInList : 0;
  }

  const creative = creativesById[chosenId] ?? null;

  if (advance) {
    saveRotationIndices(typeIndex + 1, nextWidgetIndex);
    sessionVerticalCreative = creative;
  }

  return creative;
};
