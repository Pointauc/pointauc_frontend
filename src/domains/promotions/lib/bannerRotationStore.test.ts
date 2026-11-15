import { beforeEach, describe, expect, it } from 'vitest';

import {
  getNextVerticalBannerCreative,
  getStoredRotationIndices,
  pickWeightedWidgetBannerId,
  resetVerticalBannerRotation,
  saveRotationIndices,
  VERTICAL_ROTATION_TYPE_KEY,
  VERTICAL_ROTATION_WIDGET_KEY,
  VERTICAL_WIDGET_CREATIVES_CONFIG,
} from './bannerRotationStore';

describe('bannerRotationStore', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  describe('pickWeightedWidgetBannerId (80% Memes vs 10% Word vs 10% DM)', () => {
    it('picks Memes_260 when random < 0.8', () => {
      expect(pickWeightedWidgetBannerId(() => 0)).toBe('Memes_260');
      expect(pickWeightedWidgetBannerId(() => 0.5)).toBe('Memes_260');
      expect(pickWeightedWidgetBannerId(() => 0.79)).toBe('Memes_260');
    });

    it('picks Word_260 when random is in [0.8, 0.9)', () => {
      expect(pickWeightedWidgetBannerId(() => 0.8)).toBe('Word_260');
      expect(pickWeightedWidgetBannerId(() => 0.85)).toBe('Word_260');
      expect(pickWeightedWidgetBannerId(() => 0.89)).toBe('Word_260');
    });

    it('picks DM_260 when random >= 0.9', () => {
      expect(pickWeightedWidgetBannerId(() => 0.9)).toBe('DM_260');
      expect(pickWeightedWidgetBannerId(() => 0.95)).toBe('DM_260');
      expect(pickWeightedWidgetBannerId(() => 0.999)).toBe('DM_260');
    });
  });

  describe('first banner appearance randomness (50/50 promo vs widget, and weighted widget)', () => {
    it('picks Promo (Point_260) on first appearance when random < 0.5', () => {
      // random returns 0.2 (< 0.5 -> promo) and widgetIndex 0
      const banner = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.2 });
      expect(banner?.id).toBe('Point_260');
    });

    it('picks Widget Memes_260 on first appearance when random >= 0.5 and widget random < 0.8', () => {
      let callCount = 0;
      // 1st call: 0.8 (>= 0.5 -> widget), 2nd call: 0.5 (< 0.8 -> Memes_260)
      const mockRandom = () => {
        callCount++;
        return callCount === 1 ? 0.8 : 0.5;
      };

      const banner = getNextVerticalBannerCreative({ forceNew: true, random: mockRandom });
      expect(banner?.id).toBe('Memes_260');
    });

    it('picks Widget Word_260 on first appearance when random >= 0.5 and widget random in [0.8, 0.9)', () => {
      let callCount = 0;
      // 1st call: 0.8 (>= 0.5 -> widget), 2nd call: 0.85 ([0.8, 0.9) -> Word_260)
      const mockRandom = () => {
        callCount++;
        return callCount === 1 ? 0.8 : 0.85;
      };

      const banner = getNextVerticalBannerCreative({ forceNew: true, random: mockRandom });
      expect(banner?.id).toBe('Word_260');
    });

    it('picks Widget DM_260 on first appearance when random >= 0.5 and widget random >= 0.9', () => {
      let callCount = 0;
      // 1st call: 0.8 (>= 0.5 -> widget), 2nd call: 0.95 (>= 0.9 -> DM_260)
      const mockRandom = () => {
        callCount++;
        return callCount === 1 ? 0.8 : 0.95;
      };

      const banner = getNextVerticalBannerCreative({ forceNew: true, random: mockRandom });
      expect(banner?.id).toBe('DM_260');
    });
  });

  it('rotates promo -> widget (Memes) -> promo -> widget (Word) -> promo -> widget (DM) when starting with Promo', () => {
    // 1st page load: Promocode (force random to choose promo)
    const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0 });
    expect(banner1?.id).toBe('Point_260');

    // 2nd page load: Widget (Memes_260: 80% chance, e.g. random returns 0.3)
    const banner2 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.3 });
    expect(banner2?.id).toBe('Memes_260');

    // 3rd page load: Promocode
    const banner3 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner3?.id).toBe('Point_260');

    // 4th page load: Widget (Word_260: 10% chance, e.g. random returns 0.85)
    const banner4 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.85 });
    expect(banner4?.id).toBe('Word_260');

    // 5th page load: Promocode
    const banner5 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner5?.id).toBe('Point_260');

    // 6th page load: Widget (DM_260: 10% chance, e.g. random returns 0.95)
    const banner6 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.95 });
    expect(banner6?.id).toBe('DM_260');
  });

  it('rotates widget (DM) -> promo -> widget (Memes) -> promo when starting with Widget (DM)', () => {
    let callCount = 0;
    // 1st call: 0.8 (widget), 2nd call: 0.9 (DM_260)
    const mockRandom = () => {
      callCount++;
      return callCount === 1 ? 0.8 : 0.9;
    };

    // 1st page load: Widget (DM)
    const banner1 = getNextVerticalBannerCreative({ forceNew: true, random: mockRandom });
    expect(banner1?.id).toBe('DM_260');

    // 2nd page load: Promocode
    const banner2 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner2?.id).toBe('Point_260');

    // 3rd page load: Widget (Memes)
    const banner3 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.4 });
    expect(banner3?.id).toBe('Memes_260');

    // 4th page load: Promocode
    const banner4 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner4?.id).toBe('Point_260');

    // 5th page load: Widget (DM)
    const banner5 = getNextVerticalBannerCreative({ forceNew: true, random: () => 0.95 });
    expect(banner5?.id).toBe('DM_260');
  });

  it('keeps the same banner within a single page session without forceNew', () => {
    // 1st call on page: selects Point_260 with random: () => 0
    const bannerA = getNextVerticalBannerCreative({ random: () => 0 });
    expect(bannerA?.id).toBe('Point_260');

    // Repeated renders / effect calls within the same page session: still returns Point_260 without advancing
    const bannerB = getNextVerticalBannerCreative();
    expect(bannerB?.id).toBe('Point_260');

    const bannerC = getNextVerticalBannerCreative();
    expect(bannerC?.id).toBe('Point_260');

    // Indices in storage advanced by exactly 1 for the whole page session
    const indices = getStoredRotationIndices();
    expect(indices.typeIndex).toBe(1);
    expect(indices.widgetIndex).toBe(0);
  });

  it('does not advance counters when advance is false', () => {
    const bannerA = getNextVerticalBannerCreative({ advance: false, random: () => 0 });
    expect(bannerA?.id).toBe('Point_260');

    expect(window.localStorage.getItem(VERTICAL_ROTATION_TYPE_KEY)).toBeNull();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_WIDGET_KEY)).toBeNull();
  });

  it('resets indices when resetVerticalBannerRotation is called', () => {
    saveRotationIndices(3, 1);
    expect(getStoredRotationIndices()).toEqual({ typeIndex: 3, widgetIndex: 1 });

    resetVerticalBannerRotation();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_TYPE_KEY)).toBeNull();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_WIDGET_KEY)).toBeNull();
    expect(getStoredRotationIndices(() => 0)).toEqual({ typeIndex: 0, widgetIndex: 0 });
  });
});
