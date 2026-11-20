import battery260Img from '@assets/img/ihaq/Battery_260.jpg';
import emotions260Img from '@assets/img/ihaq/Emotions_260.jpg';
import point2602Img from '@assets/img/ihaq/point_260_2.png';
import { BannerCreative, BannerSize } from '@domains/promotions/model/types';

export const BANNER_CREATIVE_POINT_260: BannerCreative = {
  id: 'Point_260',
  size: '260x400',
  imageSrc: point2602Img,
  altKey: 'promotions.banners.pointaucPromo',
  campaign: 'pointauc_promo',
  contentId: 'point_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_BATTERY_260: BannerCreative = {
  id: 'Battery_260',
  size: '260x400',
  imageSrc: battery260Img,
  altKey: 'promotions.banners.batteryWidget',
  campaign: 'battery_widget',
  contentId: 'battery_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_EMOTIONS_260: BannerCreative = {
  id: 'Emotions_260',
  size: '260x400',
  imageSrc: emotions260Img,
  altKey: 'promotions.banners.emotionsWidget',
  campaign: 'emotions_widget',
  contentId: 'emotions_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVES: BannerCreative[] = [
  BANNER_CREATIVE_POINT_260,
  BANNER_CREATIVE_BATTERY_260,
  BANNER_CREATIVE_EMOTIONS_260,
];

export const BANNER_CREATIVES_BY_SIZE: Record<BannerSize, BannerCreative[]> = {
  '800x110': [],
  '500x80': [],
  '320x165': [],
  '260x400': [
    BANNER_CREATIVE_POINT_260,
    BANNER_CREATIVE_BATTERY_260,
    BANNER_CREATIVE_EMOTIONS_260,
  ],
};

export const BANNER_CREATIVES_BY_ID: Record<string, BannerCreative> = {
  [BANNER_CREATIVE_POINT_260.id]: BANNER_CREATIVE_POINT_260,
  [BANNER_CREATIVE_BATTERY_260.id]: BANNER_CREATIVE_BATTERY_260,
  [BANNER_CREATIVE_EMOTIONS_260.id]: BANNER_CREATIVE_EMOTIONS_260,
  Remote_260: BANNER_CREATIVE_EMOTIONS_260,
};
