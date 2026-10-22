import { describe, expect, it } from 'vitest';

import { BANNER_CREATIVES_BY_SIZE } from '@domains/promotions/config/bannerRegistry';
import { selectPageBanner } from '@domains/promotions/lib/selectPageBanner';
import { BannerCreative, BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

describe('selectPageBanner with IHAQ filtering', () => {
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

describe('selectPageBanner with AB Experiments', () => {
  it('excludes auction_integrations when slotsVariant is standard', () => {
    const banner = selectPageBanner('auction', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
      experiments: {
        frequencyVariant: 'probabilistic',
        slotsVariant: 'standard',
        frequencyParams: { maxImpressions: 3, windowMs: 86400000 },
      },
    });

    expect(banner).toBeNull();
  });

  it('includes auction_integrations when slotsVariant is auction_slot', () => {
    const banner = selectPageBanner('auction', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
      experiments: {
        frequencyVariant: 'probabilistic',
        slotsVariant: 'auction_slot',
        frequencyParams: { maxImpressions: 3, windowMs: 86400000 },
      },
    });

    expect(banner).not.toBeNull();
    expect(banner?.placement).toBe('auction_integrations');
  });

  it('returns null when frequencyVariant is frequency_capped and isFrequencyCapped is true', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.01,
      isIhaqEnabled: false,
      isFrequencyCapped: true,
      experiments: {
        frequencyVariant: 'frequency_capped',
        slotsVariant: 'standard',
        frequencyParams: { maxImpressions: 3, windowMs: 86400000 },
      },
    });

    expect(banner).toBeNull();
  });

  it('returns active banner when frequencyVariant is frequency_capped and isFrequencyCapped is false', () => {
    const banner = selectPageBanner('settings', {
      globalMultiplier: 1,
      random: () => 0.99, // In probabilistic this might fail with lower coef, but frequency_capped guarantees display
      isIhaqEnabled: false,
      isFrequencyCapped: false,
      experiments: {
        frequencyVariant: 'frequency_capped',
        slotsVariant: 'standard',
        frequencyParams: { maxImpressions: 3, windowMs: 86400000 },
      },
    });

    expect(banner).not.toBeNull();
  });

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
