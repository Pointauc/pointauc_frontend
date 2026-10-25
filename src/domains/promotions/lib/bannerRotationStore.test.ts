import { beforeEach, describe, expect, it } from 'vitest';

import {
  getNextVerticalBannerCreative,
  getStoredRotationIndices,
  resetVerticalBannerRotation,
  saveRotationIndices,
  VERTICAL_ROTATION_TYPE_KEY,
  VERTICAL_ROTATION_WIDGET_KEY,
} from './bannerRotationStore';

describe('bannerRotationStore', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  it('rotates 1. Promocode banner -> 2. Widget banner with widgets rotated in their own sequence across page loads', () => {
    // 1st page load: Promocode
    const banner1 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner1?.id).toBe('Point_260');

    // 2nd page load: 1st Widget (Word)
    const banner2 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner2?.id).toBe('Word_260');

    // 3rd page load: Promocode
    const banner3 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner3?.id).toBe('Point_260');

    // 4th page load: 2nd Widget (DM)
    const banner4 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner4?.id).toBe('DM_260');

    // 5th page load: Promocode
    const banner5 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner5?.id).toBe('Point_260');

    // 6th page load: 1st Widget (Word)
    const banner6 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner6?.id).toBe('Word_260');

    // 7th page load: Promocode
    const banner7 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner7?.id).toBe('Point_260');

    // 8th page load: 2nd Widget (DM)
    const banner8 = getNextVerticalBannerCreative({ forceNew: true });
    expect(banner8?.id).toBe('DM_260');
  });

  it('keeps the same banner within a single page session without forceNew', () => {
    // 1st call on page: selects Point_260
    const bannerA = getNextVerticalBannerCreative();
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
    const bannerA = getNextVerticalBannerCreative({ advance: false });
    expect(bannerA?.id).toBe('Point_260');

    const indices = getStoredRotationIndices();
    expect(indices.typeIndex).toBe(0);
    expect(indices.widgetIndex).toBe(0);
  });

  it('resets indices when resetVerticalBannerRotation is called', () => {
    saveRotationIndices(3, 1);
    expect(getStoredRotationIndices()).toEqual({ typeIndex: 3, widgetIndex: 1 });

    resetVerticalBannerRotation();
    expect(getStoredRotationIndices()).toEqual({ typeIndex: 0, widgetIndex: 0 });
    expect(window.localStorage.getItem(VERTICAL_ROTATION_TYPE_KEY)).toBeNull();
    expect(window.localStorage.getItem(VERTICAL_ROTATION_WIDGET_KEY)).toBeNull();
  });
});
