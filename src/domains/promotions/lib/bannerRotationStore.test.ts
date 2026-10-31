import { beforeEach, describe, expect, it } from 'vitest';

import {
  getNextVerticalBannerCreative,
  getStoredRotationIndex,
  pickWeightedWidgetBannerId,
  resetVerticalBannerRotation,
  saveRotationIndex,
  VERTICAL_ROTATION_INDEX_KEY,
  VERTICAL_WIDGET_BANNER_IDS,
  VERTICAL_WIDGET_CREATIVES_CONFIG,
} from './bannerRotationStore';

describe('bannerRotationStore', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  describe('pickWeightedWidgetBannerId (equal 25% weights across 4 widget banners)', () => {
    it('picks Memes_260 when random is in [0, 0.25)', () => {
      expect(pickWeightedWidgetBannerId(() => 0)).toBe('Memes_260');
      expect(pickWeightedWidgetBannerId(() => 0.1)).toBe('Memes_260');
      expect(pickWeightedWidgetBannerId(() => 0.24)).toBe('Memes_260');
    });

    it('picks Word_260 when random is in [0.25, 0.5)', () => {
      expect(pickWeightedWidgetBannerId(() => 0.25)).toBe('Word_260');
      expect(pickWeightedWidgetBannerId(() => 0.35)).toBe('Word_260');
      expect(pickWeightedWidgetBannerId(() => 0.49)).toBe('Word_260');
    });

    it('picks DM_260 when random is in [0.5, 0.75)', () => {
      expect(pickWeightedWidgetBannerId(() => 0.5)).toBe('DM_260');
      expect(pickWeightedWidgetBannerId(() => 0.6)).toBe('DM_260');
      expect(pickWeightedWidgetBannerId(() => 0.74)).toBe('DM_260');
    });

    it('picks Battery_260 when random is in [0.75, 1.0)', () => {
      expect(pickWeightedWidgetBannerId(() => 0.75)).toBe('Battery_260');
      expect(pickWeightedWidgetBannerId(() => 0.85)).toBe('Battery_260');
      expect(pickWeightedWidgetBannerId(() => 0.999)).toBe('Battery_260');
    });
  });

  describe('first banner appearance randomness based on banner weights', () => {
    it('picks Memes_260 on first appearance when random < 0.25', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.1 });
      expect(banner?.id).toBe('Memes_260');
    });

    it('picks Word_260 on first appearance when random is in [0.25, 0.5)', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.3 });
      expect(banner?.id).toBe('Word_260');
    });

    it('picks DM_260 on first appearance when random is in [0.5, 0.75)', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.6 });
      expect(banner?.id).toBe('DM_260');
    });

    it('picks Battery_260 on first appearance when random >= 0.75', () => {
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.85 });
      expect(banner?.id).toBe('Battery_260');
    });
  });

  describe('continuous sequential rotation across subsequent renders/refreshes', () => {
    it('rotates Memes -> Word -> DM -> Battery -> Memes -> Word continuously when starting with Memes', () => {
      // 1st load: random selects Memes_260
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
      expect(banner1?.id).toBe('Memes_260');

      // 2nd load: next in sequence is Word_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('Word_260');

      // 3rd load: next in sequence is DM_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('DM_260');

      // 4th load: next in sequence is Battery_260
      const banner4 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner4?.id).toBe('Battery_260');

      // 5th load: loops back to Memes_260
      const banner5 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner5?.id).toBe('Memes_260');

      // 6th load: next is Word_260
      const banner6 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner6?.id).toBe('Word_260');
    });

    it('rotates DM -> Battery -> Memes -> Word -> DM continuously when starting with DM', () => {
      // 1st load: random selects DM_260 (0.6)
      const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.6 });
      expect(banner1?.id).toBe('DM_260');

      // 2nd load: Battery_260
      const banner2 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner2?.id).toBe('Battery_260');

      // 3rd load: Memes_260
      const banner3 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner3?.id).toBe('Memes_260');

      // 4th load: Word_260
      const banner4 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner4?.id).toBe('Word_260');

      // 5th load: DM_260
      const banner5 = getNextVerticalBannerCreative({ forceNew: true });
      expect(banner5?.id).toBe('DM_260');
    });

    it('never includes promotion banner Point_260 in rotation', () => {
      // Run through 12 consecutive cycles
      const ids: string[] = [];
      for (let i = 0; i < 12; i++) {
        const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
        if (banner) {
          ids.push(banner.id);
        }
      }
      expect(ids).not.toContain('Point_260');
      expect(ids).toContain('Memes_260');
      expect(ids).toContain('Word_260');
      expect(ids).toContain('DM_260');
      expect(ids).toContain('Battery_260');
    });
  });

  it('keeps the same banner within a single page session without forceNew', () => {
    // 1st call on page: selects Memes_260 with random: () => 0
    const bannerA = getNextVerticalBannerCreative({ random: () => 0 });
    expect(bannerA?.id).toBe('Memes_260');

    // Repeated renders / effect calls within the same page session: still returns Memes_260 without advancing
    const bannerB = getNextVerticalBannerCreative();
    expect(bannerB?.id).toBe('Memes_260');

    const bannerC = getNextVerticalBannerCreative();
    expect(bannerC?.id).toBe('Memes_260');

    // Index in storage advanced by exactly 1 for the whole page session (pointing to next: Word_260 at index 1)
    expect(getStoredRotationIndex()).toBe(1);
  });

  it('does not advance counters when advance is false', () => {
    const bannerA = getNextVerticalBannerCreative({ advance: false, random: () => 0 });
    expect(bannerA?.id).toBe('Memes_260');

    expect(window.localStorage.getItem(VERTICAL_ROTATION_INDEX_KEY)).toBeNull();
  });

  it('resets index when resetVerticalBannerRotation is called', () => {
    saveRotationIndex(2);
    expect(getStoredRotationIndex()).toBe(2);

    resetVerticalBannerRotation();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_INDEX_KEY)).toBeNull();
    expect(getStoredRotationIndex()).toBeNull();
  });
});
