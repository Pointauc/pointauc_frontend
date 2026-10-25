import { BANNER_CREATIVES_BY_ID } from '@domains/promotions/config/bannerRegistry';
import { BannerCreative } from '@domains/promotions/model/types';
import { isBrowser } from '@utils/ssr.ts';

export const VERTICAL_ROTATION_TYPE_KEY = 'pointauc_promo_vertical_type_step';
export const VERTICAL_ROTATION_WIDGET_KEY = 'pointauc_promo_vertical_widget_step';

export const VERTICAL_PROMO_BANNER_IDS = ['Point_260'] as const;
export const VERTICAL_WIDGET_BANNER_IDS = ['Word_260', 'DM_260'] as const;

let inMemoryTypeIndex = 0;
let inMemoryWidgetIndex = 0;
let sessionVerticalCreative: BannerCreative | null = null;

export const getStoredRotationIndices = (): { typeIndex: number; widgetIndex: number } => {
  if (!isBrowser) {
    return { typeIndex: inMemoryTypeIndex, widgetIndex: inMemoryWidgetIndex };
  }

  try {
    const rawType = window.localStorage.getItem(VERTICAL_ROTATION_TYPE_KEY);
    const rawWidget = window.localStorage.getItem(VERTICAL_ROTATION_WIDGET_KEY);

    const typeIndex = rawType !== null ? Math.max(0, parseInt(rawType, 10) || 0) : inMemoryTypeIndex;
    const widgetIndex = rawWidget !== null ? Math.max(0, parseInt(rawWidget, 10) || 0) : inMemoryWidgetIndex;

    return { typeIndex, widgetIndex };
  } catch {
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
  inMemoryTypeIndex = 0;
  inMemoryWidgetIndex = 0;
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
}

export const getNextVerticalBannerCreative = (
  options?: NextVerticalBannerOptions,
): BannerCreative | null => {
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const advance = options?.advance ?? true;
  const forceNew = options?.forceNew ?? false;

  // During a single page load / view, return the already selected creative so multiple React renders,
  // StrictMode mount/unmount/remount, and state updates do not advance or change the banner.
  if (sessionVerticalCreative && !forceNew) {
    return sessionVerticalCreative;
  }

  const { typeIndex, widgetIndex } = getStoredRotationIndices();

  // 1. Promocode banner (even step: 0, 2, 4...) -> 2. Widget banner (odd step: 1, 3, 5...)
  const isPromo = typeIndex % 2 === 0;

  let chosenId: string;
  let nextWidgetIndex = widgetIndex;

  if (isPromo) {
    const promoIndexInList = Math.floor(typeIndex / 2) % VERTICAL_PROMO_BANNER_IDS.length;
    chosenId = VERTICAL_PROMO_BANNER_IDS[promoIndexInList];
  } else {
    const widgetIndexInList = widgetIndex % VERTICAL_WIDGET_BANNER_IDS.length;
    chosenId = VERTICAL_WIDGET_BANNER_IDS[widgetIndexInList];
    nextWidgetIndex = (widgetIndex + 1) % VERTICAL_WIDGET_BANNER_IDS.length;
  }

  const creative = creativesById[chosenId] ?? null;

  if (advance) {
    saveRotationIndices(typeIndex + 1, nextWidgetIndex);
  }

  if (!sessionVerticalCreative || forceNew) {
    sessionVerticalCreative = creative;
  }

  return creative;
};
