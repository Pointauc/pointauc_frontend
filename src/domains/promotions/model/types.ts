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
  | 'DM_800'
  | 'DM_500'
  | 'DM_320'
  | 'Point_320'
  | 'Word_320'
  | 'Word_320_2'
  | 'Point_260'
  | 'Word_260'
  | 'DM_260'
  | 'Memes_260'
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
   * - A dictionary of banner IDs to weights: `{ DM_320: 3, Word_320: 1 }`
   * - An array of objects: `[{ bannerId: 'DM_320', weight: 3 }, { bannerId: 'Word_320', weight: 1 }]`
   * - A simple array of banner IDs: `['DM_320', 'Word_320']`
   * If omitted, all creatives registered for this placement's `size` appear with equal frequency.
   */
  banners?: PlacementBannersConfig;
}

export interface ActiveBanner {
  placement: BannerPlacement;
  creative: BannerCreative;
  url: string;
}
