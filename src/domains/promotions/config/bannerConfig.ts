import { BannerPlacement, BannerPlacementConfig } from '@domains/promotions/model/types';

export const DEFAULT_GLOBAL_MULTIPLIER = 0.75;
export const DEFAULT_UTM_SOURCE = 'pointauc';
export const DEFAULT_BASE_URL = 'https://ihaqdonate.com/';

export const DEFAULT_BANNER_PLACEMENTS_CONFIG: Record<BannerPlacement, BannerPlacementConfig> = {
  settings_top: {
    coefficient: 0.5,
    size: '800x110',
    page: 'settings',
  },
  settings_bottom_left: {
    coefficient: 0.5,
    size: '320x165',
    page: 'settings',
  },
  overlays_top: {
    coefficient: 0.5,
    size: '800x110',
    page: 'overlays',
  },
  history_bottom: {
    coefficient: 0.5,
    size: '500x80',
    page: 'history',
  },
};
