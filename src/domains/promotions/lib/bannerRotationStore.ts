import { BANNER_CREATIVES_BY_ID } from '@domains/promotions/config/bannerRegistry';
import { BannerCreative } from '@domains/promotions/model/types';
import { isBrowser } from '@utils/ssr.ts';

export const VERTICAL_ROTATION_INDEX_KEY = 'pointauc_promo_vertical_banner_index';

/**
 * Legacy storage keys from the old widget-vs-promo banner rotation logic.
 * Cleaned up on reset to avoid stale entries in users' localStorage.
 */
const LEGACY_ROTATION_KEYS = [
  'pointauc_promo_vertical_widget_index',
  'pointauc_promo_vertical_type_step',
  'pointauc_promo_vertical_widget_step',
] as const;

export const VERTICAL_BANNER_IDS = [
  'DonatnoeNebo_Streamer_260',
  'DonatnoeNebo_Universe_260',
] as const;

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

export const resetVerticalBannerRotation = (): void => {
  inMemoryIndex = null;
  sessionVerticalCreative = null;

  if (isBrowser) {
    try {
      window.localStorage.removeItem(VERTICAL_ROTATION_INDEX_KEY);
      for (const key of LEGACY_ROTATION_KEYS) {
        window.localStorage.removeItem(key);
      }
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
  bannerIds?: readonly string[];
}

/**
 * Picks the vertical banner to show on the current page view.
 *
 * - First ever visit: one of the banners is picked randomly with equal weight
 *   (50/50 for two banners).
 * - Subsequent visits: banners alternate continuously (A → B → A → ...).
 * - Within a single page load / view the already selected creative is returned
 *   so multiple React renders, StrictMode mount/unmount/remount, and state
 *   updates do not advance or change the banner.
 */
export const getNextVerticalBannerCreative = (
  options?: NextVerticalBannerOptions,
): BannerCreative | null => {
  const creativesById = options?.creativesById ?? BANNER_CREATIVES_BY_ID;
  const advance = options?.advance ?? true;
  const forceNew = options?.forceNew ?? false;
  const random = options?.random ?? Math.random;
  const bannerIds = options?.bannerIds ?? VERTICAL_BANNER_IDS;

  if (bannerIds.length === 0) {
    return null;
  }

  // During a single page load / view, return the already selected creative.
  if (sessionVerticalCreative && !forceNew) {
    return sessionVerticalCreative;
  }

  const storedIndex = getStoredRotationIndex();

  let currentIndex: number;

  if (storedIndex !== null) {
    // Subsequent visits: rotate continuously from the stored index.
    currentIndex = storedIndex % bannerIds.length;
  } else {
    // First visit: pick one of the banners randomly with equal weight.
    currentIndex = Math.min(
      Math.floor(random() * bannerIds.length),
      bannerIds.length - 1,
    );
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
