import { isBrowser } from '@utils/ssr.ts';
import { FrequencyCappedParams, FrequencyCapStatus } from '@domains/promotions/model/experimentTypes';

export const BANNER_IMPRESSIONS_STORAGE_KEY = 'pointauc_promo_banner_impressions';
export const BANNER_DISMISSED_UNTIL_STORAGE_KEY = 'pointauc_promo_banners_dismissed_until';
export const DEFAULT_BANNER_DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

let inMemoryTimestamps: number[] = [];
let inMemoryDismissedUntil: number | null = null;

export const getStoredImpressionTimestamps = (): number[] => {
  if (!isBrowser) {
    return inMemoryTimestamps;
  }

  try {
    const raw = window.localStorage.getItem(BANNER_IMPRESSIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is number => typeof item === 'number' && Number.isFinite(item));
    }
    return [];
  } catch {
    return inMemoryTimestamps;
  }
};

export const saveImpressionTimestamps = (timestamps: number[]): void => {
  inMemoryTimestamps = [...timestamps];

  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(BANNER_IMPRESSIONS_STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // Ignore storage quota or disabled localStorage errors
  }
};

export const getBannersDismissedUntil = (): number | null => {
  if (!isBrowser) {
    return inMemoryDismissedUntil;
  }

  try {
    const raw = window.localStorage.getItem(BANNER_DISMISSED_UNTIL_STORAGE_KEY);
    if (!raw) {
      return inMemoryDismissedUntil;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return inMemoryDismissedUntil;
  }
};

export const saveBannersDismissedUntil = (timestamp: number | null): void => {
  inMemoryDismissedUntil = timestamp;

  if (!isBrowser) {
    return;
  }

  try {
    if (timestamp === null) {
      window.localStorage.removeItem(BANNER_DISMISSED_UNTIL_STORAGE_KEY);
    } else {
      window.localStorage.setItem(BANNER_DISMISSED_UNTIL_STORAGE_KEY, timestamp.toString());
    }
  } catch {
    // Ignore
  }
};

export const isBannersDismissed = (now = Date.now()): boolean => {
  const until = getBannersDismissedUntil();
  if (until === null) {
    return false;
  }
  return now < until;
};

export const dismissAllBanners = (
  durationMs = DEFAULT_BANNER_DISMISS_DURATION_MS,
  now = Date.now(),
): void => {
  const until = now + durationMs;
  saveBannersDismissedUntil(until);
};

export const clearBannerDismissal = (): void => {
  saveBannersDismissedUntil(null);
};

export const cleanExpiredTimestamps = (
  timestamps: number[],
  windowMs: number,
  now = Date.now(),
): number[] => {
  const cutoff = now - windowMs;
  return timestamps.filter((timestamp) => timestamp > cutoff).sort((a, b) => a - b);
};

export const getFrequencyCapStatus = (
  params: FrequencyCappedParams,
  now = Date.now(),
): FrequencyCapStatus => {
  const rawTimestamps = getStoredImpressionTimestamps();
  const validTimestamps = cleanExpiredTimestamps(rawTimestamps, params.windowMs, now);

  // If expired timestamps were cleaned out, persist the pruned list
  if (validTimestamps.length !== rawTimestamps.length) {
    saveImpressionTimestamps(validTimestamps);
  }

  const isCapped = validTimestamps.length >= params.maxImpressions;
  const oldestTimestamp = validTimestamps[0] ?? null;
  const cooldownExpiresAt = isCapped && oldestTimestamp !== null ? oldestTimestamp + params.windowMs : null;

  return {
    impressionsCount: validTimestamps.length,
    maxImpressions: params.maxImpressions,
    windowMs: params.windowMs,
    isCapped,
    cooldownExpiresAt,
  };
};

export const recordBannerImpression = (
  now = Date.now(),
  params?: FrequencyCappedParams,
): void => {
  const current = getStoredImpressionTimestamps();
  const windowMs = params?.windowMs ?? 24 * 60 * 60 * 1000;
  const cleaned = cleanExpiredTimestamps(current, windowMs, now);
  cleaned.push(now);
  saveImpressionTimestamps(cleaned);
};

export const clearFrequencyCapHistory = (): void => {
  inMemoryTimestamps = [];
  clearBannerDismissal();

  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(BANNER_IMPRESSIONS_STORAGE_KEY);
  } catch {
    // Ignore
  }
};
