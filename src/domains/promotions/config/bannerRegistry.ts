import streamer260Img from '@assets/img/ihaq/DonatnoeNebo_Streamer_260.png';
import universe260Img from '@assets/img/ihaq/DonatnoeNebo_Universe_260.png';
import { BannerCreative, BannerSize } from '@domains/promotions/model/types';

export const BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260: BannerCreative = {
  id: 'DonatnoeNebo_Streamer_260',
  size: '260x400',
  imageSrc: streamer260Img,
  altKey: 'promotions.banners.donatnoeNebo',
  campaign: 'donatnoe_nebo',
  contentId: 'donatnoe_nebo_streamer_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_DONATNOE_NEBO_UNIVERSE_260: BannerCreative = {
  id: 'DonatnoeNebo_Universe_260',
  size: '260x400',
  imageSrc: universe260Img,
  altKey: 'promotions.banners.donatnoeNebo',
  campaign: 'donatnoe_nebo',
  contentId: 'donatnoe_nebo_universe_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVES: BannerCreative[] = [
  BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260,
  BANNER_CREATIVE_DONATNOE_NEBO_UNIVERSE_260,
];

export const BANNER_CREATIVES_BY_SIZE: Record<BannerSize, BannerCreative[]> = {
  '800x110': [],
  '500x80': [],
  '320x165': [],
  '260x400': [
    BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260,
    BANNER_CREATIVE_DONATNOE_NEBO_UNIVERSE_260,
  ],
};

export const BANNER_CREATIVES_BY_ID: Record<string, BannerCreative> = {
  [BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260.id]: BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260,
  [BANNER_CREATIVE_DONATNOE_NEBO_UNIVERSE_260.id]: BANNER_CREATIVE_DONATNOE_NEBO_UNIVERSE_260,
};
