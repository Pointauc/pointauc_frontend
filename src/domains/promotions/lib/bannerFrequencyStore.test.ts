import { beforeEach, describe, expect, it } from 'vitest';

import {
  cleanExpiredTimestamps,
  clearBannerDismissal,
  clearFrequencyCapHistory,
  dismissAllBanners,
  getFrequencyCapStatus,
  getStoredImpressionTimestamps,
  isBannersDismissed,
  recordBannerImpression,
  saveImpressionTimestamps,
} from '@domains/promotions/lib/bannerFrequencyStore';

describe('bannerFrequencyStore', () => {
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  beforeEach(() => {
    clearFrequencyCapHistory();
  });

  it('saves and reads impression timestamps', () => {
    saveImpressionTimestamps([1000, 2000]);
    expect(getStoredImpressionTimestamps()).toEqual([1000, 2000]);
  });

  it('filters out expired timestamps outside the window', () => {
    const now = 100000;
    const windowMs = 50000;
    const timestamps = [40000, 50000, 60000, 90000]; // 40000 and 50000 are <= now - windowMs

    const cleaned = cleanExpiredTimestamps(timestamps, windowMs, now);
    expect(cleaned).toEqual([60000, 90000]);
  });

  it('reports isCapped false when impression count is below maxImpressions', () => {
    const now = 10000;
    saveImpressionTimestamps([2000, 3000]);

    const status = getFrequencyCapStatus({ maxImpressions: 3, windowMs: oneDay }, now);

    expect(status.isCapped).toBe(false);
    expect(status.impressionsCount).toBe(2);
    expect(status.cooldownExpiresAt).toBeNull();
  });

  it('reports isCapped true and cooldownExpiresAt when impression count reaches limit', () => {
    const now = 10000;
    const firstImpression = 2000;
    saveImpressionTimestamps([firstImpression, 4000, 6000]);

    const status = getFrequencyCapStatus({ maxImpressions: 3, windowMs: oneDay }, now);

    expect(status.isCapped).toBe(true);
    expect(status.impressionsCount).toBe(3);
    expect(status.cooldownExpiresAt).toBe(firstImpression + oneDay);
  });

  it('records new impressions and prunes expired ones', () => {
    const initialNow = 1000;
    recordBannerImpression(initialNow, { maxImpressions: 3, windowMs: oneDay });

    expect(getStoredImpressionTimestamps()).toEqual([1000]);

    recordBannerImpression(2000, { maxImpressions: 3, windowMs: oneDay });
    expect(getStoredImpressionTimestamps()).toEqual([1000, 2000]);
  });

  it('clears history completely', () => {
    saveImpressionTimestamps([1000, 2000]);
    clearFrequencyCapHistory();
    expect(getStoredImpressionTimestamps()).toEqual([]);
  });

  it('dismissAllBanners stops banners for 24 hours', () => {
    const now = 100000;
    expect(isBannersDismissed(now)).toBe(false);

    dismissAllBanners(oneDay, now);
    expect(isBannersDismissed(now)).toBe(true);
    expect(isBannersDismissed(now + oneHour)).toBe(true);
    expect(isBannersDismissed(now + oneDay - 1000)).toBe(true);
    expect(isBannersDismissed(now + oneDay + 1000)).toBe(false);

    clearBannerDismissal();
    expect(isBannersDismissed(now)).toBe(false);
  });
});
