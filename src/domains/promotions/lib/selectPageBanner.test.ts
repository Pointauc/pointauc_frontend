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
    const customPlacements: Record<BannerPlacement, BannerPlacementConfig> = {
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
    const customPlacements: Record<BannerPlacement, BannerPlacementConfig> = {
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
