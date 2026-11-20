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

  describe('first banner appearance randomness (equal weights across 3 banners)', () => {
    it('picks Point_260 on first appearance when random is in [0, 1/3)', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
      expect(banner?.id).toBe('Point_260');
    });

    it('picks Battery_260 on first appearance when random is in [1/3, 2/3)', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.4 });
      expect(banner?.id).toBe('Battery_260');
    });

    it('picks Emotions_260 on first appearance when random is in [2/3, 1)', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.8 });
      expect(banner?.id).toBe('Emotions_260');
    });
  });

  describe('continuous sequential rotation across subsequent renders/refreshes', () => {
    it('rotates Point -> Battery -> Emotions -> Point continuously when starting with Point', () => {
      // 1st load: random selects Point_260
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
      expect(banner1?.id).toBe('Point_260');

      // 2nd load: next in sequence is Battery_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('Battery_260');

      // 3rd load: next in sequence is Emotions_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('Emotions_260');

      // 4th load: loops back to Point_260
      const banner4 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner4?.id).toBe('Point_260');
    });

    it('rotates Battery -> Emotions -> Point -> Battery continuously when starting with Battery', () => {
      // 1st load: random selects Battery_260 (0.4)
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.4 });
      expect(banner1?.id).toBe('Battery_260');

      // 2nd load: Emotions_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('Emotions_260');

      // 3rd load: Point_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('Point_260');

      // 4th load: Battery_260
      const banner4 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner4?.id).toBe('Battery_260');
    });

    it('only includes the registered vertical banners in rotation', () => {
      const ids: string[] = [];
      for (let i = 0; i < 9; i++) {
        const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
        if (banner) {
          ids.push(banner.id);
        }
      }
      expect(new Set(ids)).toEqual(new Set([...VERTICAL_BANNER_IDS]));
    });

    it('gracefully filters out unknown or deleted banner IDs and picks available creatives', () => {
      const banner = getNextVerticalBannerCreative({
        forceNew: true,
        bannerIds: ['Old_Deleted_Banner', 'Point_260'],
        random: () => 0,
      });
      expect(banner?.id).toBe('Point_260');
    });
  });

  it('keeps the same banner within a single page session without forceNew', () => {
    // 1st call on page: selects Point_260 with random: () => 0
    const bannerA = getNextVerticalBannerCreative({ random: () => 0 });
    expect(bannerA?.id).toBe('Point_260');

    // Repeated renders / effect calls within the same page session: still returns the same banner without advancing
    const bannerB = getNextVerticalBannerCreative();
    expect(bannerB?.id).toBe('Point_260');

    const bannerC = getNextVerticalBannerCreative();
    expect(bannerC?.id).toBe('Point_260');

    // Index in storage advanced by exactly 1 for the whole page session (pointing to next banner at index 1)
    expect(getStoredRotationIndex()).toBe(1);
  });

  it('does not advance counters when advance is false', () => {
    const bannerA = getNextVerticalBannerCreative({ advance: false, random: () => 0 });
    expect(bannerA?.id).toBe('Point_260');

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
