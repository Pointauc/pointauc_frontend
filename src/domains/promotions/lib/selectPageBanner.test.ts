import { beforeEach, describe, expect, it } from 'vitest';

import { resetVerticalBannerRotation } from '@domains/promotions/lib/bannerRotationStore';
import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { BannerCreative, BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

describe('selectPageBanner with IHAQ filtering', () => {
  beforeEach(() => {
    resetVerticalBannerRotation();
  });

  it('returns null on settings pages because previous banners were removed from the registry', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
    });

    expect(banner).toBeNull();
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

  it('always shows vertical banner on the main page and rotates banners continuously', () => {
    const banner1 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0 });
    expect(banner1?.placement).toBe('auction_bids');
    expect(banner1?.creative.id).toBe('DonatnoeNebo_Streamer_260');

    // 2nd load: DonatnoeNebo_Universe_260
    const banner2 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true });
    expect(banner2?.placement).toBe('auction_bids');
    expect(banner2?.creative.id).toBe('DonatnoeNebo_Universe_260');

    // 3rd load: loops back to DonatnoeNebo_Streamer_260
    const banner3 = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true });
    expect(banner3?.placement).toBe('auction_bids');
    expect(banner3?.creative.id).toBe('DonatnoeNebo_Streamer_260');
  });

  it('can start randomly with either banner on first appearance', () => {
    const banner = selectPageBanner('auction', { isIhaqEnabled: false, forceNewRotation: true, random: () => 0.8 });
    expect(banner?.placement).toBe('auction_bids');
    expect(banner?.creative.id).toBe('DonatnoeNebo_Universe_260');
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
  const testCreatives: BannerCreative[] = [
    {
      id: 'test_a',
      size: '320x165',
      imageSrc: '/test-a.png',
      altKey: 'test.a',
      campaign: 'test',
      contentId: 'a',
    },
    {
      id: 'test_b',
      size: '320x165',
      imageSrc: '/test-b.png',
      altKey: 'test.b',
      campaign: 'test',
      contentId: 'b',
    },
    {
      id: 'test_c',
      size: '320x165',
      imageSrc: '/test-c.png',
      altKey: 'test.c',
      campaign: 'test',
      contentId: 'c',
    },
  ];

  const creativesById = Object.fromEntries(
    testCreatives.map((creative) => [creative.id, creative]),
  );

  it('only shows banners explicitly configured for that placement', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: {
          test_a: 1,
        },
      },
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesById,
      globalMultiplier: 1,
      random: () => 0,
      isIhaqEnabled: false,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.id).toBe('test_a');
  });

  it('selects banners according to their relative appearance frequency / weights', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: {
          test_b: 3, // 75%
          test_a: 1, // 25%
        },
      },
    };

    // With total weight 4, random 0.2 gives r = 0.8 < 3 -> test_b
    const banner1 = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesById,
      globalMultiplier: 1,
      random: () => 0.2,
      isIhaqEnabled: false,
    });
    expect(banner1?.creative.id).toBe('test_b');

    // With total weight 4, random 0.9 gives r = 3.6 > 3 -> test_a
    const banner2 = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesById,
      globalMultiplier: 1,
      random: () => 0.9,
      isIhaqEnabled: false,
    });
    expect(banner2?.creative.id).toBe('test_a');
  });

  it('supports banners as array of banner IDs or objects with weights', () => {
    const customPlacements: Partial<Record<BannerPlacement, BannerPlacementConfig>> = {
      settings_bottom_left: {
        coefficient: 1,
        size: '320x165',
        page: 'settings',
        banners: [
          { bannerId: 'test_a', weight: 1 },
          { bannerId: 'test_c', weight: 2 },
        ],
      },
    };

    const banner = selectPageBanner('settings', {
      placementsConfig: customPlacements,
      creativesById,
      globalMultiplier: 1,
      random: () => 0.8,
      isIhaqEnabled: false,
    });

    expect(banner).not.toBeNull();
    expect(banner?.creative.id).toBe('test_c');
  });
});
