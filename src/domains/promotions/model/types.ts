export type BannerPage = 'settings' | 'overlays' | 'history' | 'auction';

export type BannerPlacement =
  | 'settings_top'
  | 'settings_bottom_left'
  | 'overlays_top'
  | 'history_bottom'
  | 'auction_integrations'
  | 'auction_bids';

export type BannerSize = '800x110' | '320x165' | '500x80' | '260x400';

export type BannerCreativeId =
  | 'DonatnoeNebo_Streamer_260'
  | 'DonatnoeNebo_Universe_260'
  | (string & {});

export interface PlacementBannerWeight {
  bannerId: BannerCreativeId;
  weight?: number;
}

export type PlacementBannersConfig =
  | (BannerCreativeId | PlacementBannerWeight)[]
  | Partial<Record<BannerCreativeId, number>>
  | Record<string, number>;

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
  /**
   * Optional configuration of exact banners allowed to appear in this placement
   * and their relative appearance frequency / weights.
   * Can be specified as:
   * - A dictionary of banner IDs to weights: `{ DonatnoeNebo_Streamer_260: 1, DonatnoeNebo_Universe_260: 1 }`
   * - An array of objects: `[{ bannerId: 'DonatnoeNebo_Streamer_260', weight: 1 }]`
   * - A simple array of banner IDs: `['DonatnoeNebo_Streamer_260']`
   * If omitted, all creatives registered for this placement's `size` appear with equal frequency.
   */
  banners?: PlacementBannersConfig;
}

export interface ActiveBanner {
  placement: BannerPlacement;
  creative: BannerCreative;
  url: string;
}
