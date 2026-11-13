import { BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

export const DEFAULT_GLOBAL_MULTIPLIER = 0.75;
export const DEFAULT_UTM_SOURCE = 'pointauc';
export const DEFAULT_BASE_URL = 'https://ihaqdonate.com/donatnoe-nebo';

export const DEFAULT_BANNER_PLACEMENTS_CONFIG: Record<BannerPlacement, BannerPlacementConfig> = {
  settings_top: {
    coefficient: 0,
    size: '800x110',
    page: 'settings',
    banners: {},
  },
  auction_bids: {
    coefficient: 1,
    size: '260x400',
    page: 'auction',
    banners: {
      DonatnoeNebo_Streamer_260: 1,
      DonatnoeNebo_Universe_260: 1,
    },
  },
  settings_bottom_left: {
    coefficient: 0,
    size: '320x165',
    page: 'settings',
    banners: {},
  },
  overlays_top: {
    coefficient: 0,
    size: '800x110',
    page: 'overlays',
    banners: {},
  },
  history_bottom: {
    coefficient: 0,
    size: '500x80',
    page: 'history',
    banners: {},
  },
  auction_integrations: {
    coefficient: 0,
    size: '320x165',
    page: 'auction',
    banners: {},
  },
};
