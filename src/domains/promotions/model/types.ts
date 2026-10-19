export type BannerPage = 'settings' | 'overlays' | 'history';

export type BannerPlacement = 'settings_top' | 'settings_bottom_left' | 'overlays_top' | 'history_bottom';

export type BannerSize = '800x110' | '320x165' | '500x80';

export interface BannerCreative {
  id: string;
  size: BannerSize;
  imageSrc: string;
  altKey: string;
  campaign: string;
  contentId: string;
  partner?: string;
}

export interface BannerPlacementConfig {
  coefficient: number;
  size: BannerSize;
  page: BannerPage;
}

export interface ActiveBanner {
  placement: BannerPlacement;
  creative: BannerCreative;
  url: string;
}
