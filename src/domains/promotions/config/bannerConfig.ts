import { BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

export const DEFAULT_GLOBAL_MULTIPLIER = 0.75;
export const DEFAULT_UTM_SOURCE = 'pointauc';
export const DEFAULT_BASE_URL = 'https://ihaqdonate.com/';

export const DEFAULT_BANNER_PLACEMENTS_CONFIG: Record<BannerPlacement, BannerPlacementConfig> = {
  settings_top: {
    coefficient: 0.5,
    size: '800x110',
    page: 'settings',
    banners: {
      DM_800: 1,
    },
  },
  auction_bids: {
    coefficient: 1,
    size: '260x400',
    page: 'auction',
    banners: {
      Memes_260: 1,
      Word_260: 1,
      DM_260: 1,
      Battery_260: 1,
    },
  },
  settings_bottom_left: {
    coefficient: 0,
    size: '320x165',
    page: 'settings',
    banners: {
      DM_320: 1,
      Point_320: 1,
      Word_320: 1,
      Word_320_2: 1,
    },
  },
  overlays_top: {
    coefficient: 0,
    size: '800x110',
    page: 'overlays',
    banners: {
      DM_800: 1,
    },
  },
  history_bottom: {
    coefficient: 0,
    size: '500x80',
    page: 'history',
    banners: {
      DM_500: 1,
    },
  },
  auction_integrations: {
    coefficient: 0,
    size: '320x165',
    page: 'auction',
    banners: {
      Point_320: 1,
    },
  },
};
