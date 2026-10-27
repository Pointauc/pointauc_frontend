import { beforeEach, describe, expect, it } from 'vitest';

import { resetVerticalBannerRotation } from '@domains/promotions/lib/bannerRotationStore';
import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { BannerCreative, BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

describe('selectPageBanner with IHAQ filtering', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  it('returns an active banner when isIhaqEnabled is false and probability passes', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.partner).toBe('ihaq');
  });

  it('returns null when isIhaqEnabled is true because all registry creatives are IHAQ', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: true,
    });

    expect(banner).toBeNull();
  });

  it('filters out IHAQ partner creatives and picks only non-IHAQ creatives', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_top: { coefficient: 1, size: '800x110', page: 'settings' },
      settings_bottom_left: { coefficient: 0, size: '320x165', page: 'settings' },
      overlays_top: { coefficient: 0, size: '800x110', page: 'overlays' },
      history_bottom: { coefficient: 0, size: '500x80', page: 'history' },
    };

    const partnerCreative: BannerCreative = {
      id: 'ihaq_1',
      size: '800x110',
      imageSrc: '/test-ihaq.png',
      altKey: 'test.ihaq',
      campaign: 'test',
      contentId: '1',
      partner: 'ihaq',
    };

    const regularCreative: BannerCreative = {
      id: 'regular_1',
      size: '800x110',
      imageSrc: '/test-regular.png',
      altKey: 'test.regular',
      campaign: 'test',
      contentId: '2',
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesBySize: {
        '800x110': [partnerCreative, regularCreative],
        '320x165': [],
        '500x80': [],
        '260x400': [],
      },
      globalMultiplier: 1,
      random: () => 0,
      isIhaqEnabled: true,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.id).toBe('regular_1');
    expect(banner?.creative.partner).toBeUndefined();
  });

  it('excludes placements that have only IHAQ creatives when isIhaqEnabled is true', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_top: { coefficient: 1, size: '800x110', page: 'settings' },
      settings_bottom_left: { coefficient: 1, size: '320x165', page: 'settings' },
      overlays_top: { coefficient: 0, size: '800x110', page: 'overlays' },
      history_bottom: { coefficient: 0, size: '500x80', page: 'history' },
    };

    const ihaqOnly800: BannerCreative = {
      id: 'ihaq_800',
      size: '800x110',
      imageSrc: '/test-ihaq-800.png',
      altKey: 'test.ihaq',
      campaign: 'test',
      contentId: '1',
      partner: 'ihaq',
    };

    const nonIhaq320: BannerCreative = {
      id: 'non_ihaq_320',
      size: '320x165',
      imageSrc: '/test-320.png',
      altKey: 'test.non_ihaq',
      campaign: 'test',
      contentId: '2',
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesBySize: {
        '800x110': [ihaqOnly800],
        '320x165': [nonIhaq320],
        '500x80': [],
        '260x400': [],
      },
      globalMultiplier: 1,
      random: () => 0,
      isIhaqEnabled: true,
    });

    expect(banner).not.toBeNull();
    expect(banner?.placement).toBe('settings_bottom_left');
    expect(banner?.creative.id).toBe('non_ihaq_320');
  });
});

describe('selectPageBanner on auction page', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  it('always shows vertical banner on the main page and rotates promo -> widget -> promo -> widget', () => {
    const banner1 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0 });
    expect(banner1?.placement).toBe('auction_bids');
    expect(banner1?.creative.id).toBe('Point_260');

    // 2nd load: Widget step (random returns 0.3 -> Memes_260)
    const banner2 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0.3 });
    expect(banner2?.placement).toBe('auction_bids');
    expect(banner2?.creative.id).toBe('Memes_260');

    const banner3 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0 });
    expect(banner3?.placement).toBe('auction_bids');
    expect(banner3?.creative.id).toBe('Point_260');

    // 4th load: Widget step (random returns 0.95 -> DM_260)
    const banner4 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0.95 });
    expect(banner4?.placement).toBe('auction_bids');
    expect(banner4?.creative.id).toBe('DM_260');
  });

  it('can start randomly with a widget on first appearance', () => {
    let callCount = 0;
    // 1st call: 0.8 (widget), 2nd call: 0.9 (DM_260)
    const mockRandom = () => {
      callCount++;
      return callCount === 1 ? 0.8 : 0.9;
    };

    const banner = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: mockRandom });
    expect(banner?.placement).toBe('auction_bids');
    expect(banner?.creative.id).toBe('DM_260');
  });

  it('returns null on auction page when dismissed', () => {
    const banner = selectPageBanner('auction', { isIhaqEnabled: false, isDismissed: true });
    expect(banner).toBeNull();
  });

  it('returns null on auction page when IHAQ is already enabled', () => {
    const banner = selectPageBanner('auction', { isIhaqEnabled: true });
    expect(banner).toBeNull();
  });

  it('returns null for disabled placements on other pages like overlays or history', () => {
    expect(selectPageBanner('overlays', { isIhaqEnabled: false })).toBeNull();
    expect(selectPageBanner('history', { isIhaqEnabled: false })).toBeNull();
  });
});

describe('selectPageBanner dismissal', () => {
  it('returns null when isDismissed is true', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
      isDismissed: true,
    });

    expect(banner).toBeNull();
  });
});

describe('selectPageBanner with placement-specific banners and appearance frequencies', () => {
  it('only shows banners explicitly configured for that placement', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: {
          Word_320: 1,
        },
      },
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      globalMultiplier: 1,
      random: () => 0,
      isIhaqEnabled: false,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.id).toBe('Word_320');
  });

  it('selects banners according to their relative appearance frequency / weights', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: {
          DM_320: 3,    // 75%
          Point_320: 1, // 25%
        },
      },
    };

    // With total weight 4, random 0.2 gives r = 0.8 < 3 -> DM_320
    const banner1 = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      globalMultiplier: 1,
      random: () => 0.2,
      isIhaqEnabled: false,
    });
    expect(banner1?.creative.id).toBe('DM_320');

    // With total weight 4, random 0.9 gives r = 3.6 > 3 -> Point_320
    const banner2 = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      globalMultiplier: 1,
      random: () => 0.9,
      isIhaqEnabled: false,
    });
    expect(banner2?.creative.id).toBe('Point_320');
  });

  it('supports banners as array of banner IDs or objects with weights', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: [
          { bannerId: 'Word_320', weight: 1 },
          { bannerId: 'Word_320_2', weight: 2 },
        ],
      },
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      globalMultiplier: 1,
      random: () => 0.8,
      isIhaqEnabled: false,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.id).toBe('Word_320_2');
  });
});
