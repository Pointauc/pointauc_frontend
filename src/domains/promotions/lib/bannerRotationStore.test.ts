import { beforeEach, describe, expect, it } from 'vitest';

import {
  getNextVerticalBannerCreative,
  getStoredRotationIndex,
  resetVerticalBannerRotation,
  saveRotationIndex,
  VERTICAL_BANNER_IDS,
  VERTICAL_ROTATION_INDEX_KEY,
} from './bannerRotationStore';

describe('bannerRotationStore', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  describe('first banner appearance randomness (equal 50/50 weights)', () => {
    it('picks DonatnoeNebo_Streamer_260 on first appearance when random < 0.5', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
      expect(banner?.id).toBe('DonatnoeNebo_Streamer_260');
    });

    it('picks DonatnoeNebo_Universe_260 on first appearance when random >= 0.5', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.75 });
      expect(banner?.id).toBe('DonatnoeNebo_Universe_260');
    });
  });

  describe('continuous sequential rotation across subsequent renders/refreshes', () => {
    it('rotates Streamer -> Universe -> Streamer continuously when starting with Streamer', () => {
      // 1st load: random selects DonatnoeNebo_Streamer_260
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
      expect(banner1?.id).toBe('DonatnoeNebo_Streamer_260');

      // 2nd load: next in sequence is DonatnoeNebo_Universe_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('DonatnoeNebo_Universe_260');

      // 3rd load: loops back to DonatnoeNebo_Streamer_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('DonatnoeNebo_Streamer_260');

      // 4th load: next is DonatnoeNebo_Universe_260
      const banner4 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner4?.id).toBe('DonatnoeNebo_Universe_260');
    });

    it('rotates Universe -> Streamer -> Universe continuously when starting with Universe', () => {
      // 1st load: random selects DonatnoeNebo_Universe_260 (0.75)
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.75 });
      expect(banner1?.id).toBe('DonatnoeNebo_Universe_260');

      // 2nd load: DonatnoeNebo_Streamer_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('DonatnoeNebo_Streamer_260');

      // 3rd load: DonatnoeNebo_Universe_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('DonatnoeNebo_Universe_260');
    });

    it('only includes the two Donatnoe Nebo banners in rotation', () => {
      const ids: string[] = [];
      for (let i = 0; i < 8; i++) {
        const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
        if (banner) {
          ids.push(banner.id);
        }
      }
      expect(new Set(ids)).toEqual(new Set([...VERTICAL_BANNER_IDS]));
    });
  });

  it('keeps the same banner within a single page session without forceNew', () => {
    // 1st call on page: selects DonatnoeNebo_Streamer_260 with random: () => 0
    const bannerA = getNextVerticalBannerCreative({ random: () => 0 });
    expect(bannerA?.id).toBe('DonatnoeNebo_Streamer_260');

    // Repeated renders / effect calls within the same page session: still returns the same banner without advancing
    const bannerB = getNextVerticalBannerCreative();
    expect(bannerB?.id).toBe('DonatnoeNebo_Streamer_260');

    const bannerC = getNextVerticalBannerCreative();
    expect(bannerC?.id).toBe('DonatnoeNebo_Streamer_260');

    // Index in storage advanced by exactly 1 for the whole page session (pointing to next banner at index 1)
    expect(getStoredRotationIndex()).toBe(1);
  });

  it('does not advance counters when advance is false', () => {
    const bannerA = getNextVerticalBannerCreative({ advance: false, random: () => 0 });
    expect(bannerA?.id).toBe('DonatnoeNebo_Streamer_260');

    expect(window.localStorage.getItem(VERTICAL_ROTATION_INDEX_KEY)).toBeNull();
  });

  it('resets index when resetVerticalBannerRotation is called', () => {
    saveRotationIndex(1);
    expect(getStoredRotationIndex()).toBe(1);

    resetVerticalBannerRotation();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_INDEX_KEY)).toBeNull();
    expect(getStoredRotationIndex()).toBeNull();
  });

  it('cleans up legacy widget/promo rotation storage keys on reset', () => {
    window.localStorage.setItem('pointauc_promo_vertical_widget_index', '2');
    window.localStorage.setItem('pointauc_promo_vertical_type_step', '1');
    window.localStorage.setItem('pointauc_promo_vertical_widget_step', '1');

    resetVerticalBannerRotation();

    expect(window.localStorage.getItem('pointauc_promo_vertical_widget_index')).toBeNull();
    expect(window.localStorage.getItem('pointauc_promo_vertical_type_step')).toBeNull();
    expect(window.localStorage.getItem('pointauc_promo_vertical_widget_step')).toBeNull();
  });
});
