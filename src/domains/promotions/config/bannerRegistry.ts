import dm800Img from '@assets/img/ihaq/DM_800.png';
import dm500Img from '@assets/img/ihaq/DM_500.png';
import dm320Img from '@assets/img/ihaq/DM_320.png';
import point320Img from '@assets/img/ihaq/Point_320.png';
import word320Img from '@assets/img/ihaq/Word_320.png';
import word3202Img from '@assets/img/ihaq/Word_320_2.png';
import dm260Img from '@assets/img/ihaq/DM_260.png';
import point2602Img from '@assets/img/ihaq/point_260_2.png';
import word260Img from '@assets/img/ihaq/Word_260.png';
import memes260Img from '@assets/img/ihaq/Memes_260.png';
import { BannerCreative, BannerSize } from '@domains/promotions/model/types';

export const BANNER_CREATIVE_DM_800: BannerCreative = {
  id: 'DM_800',
  size: '800x110',
  imageSrc: dm800Img,
  altKey: 'promotions.banners.donatMiner',
  campaign: 'donat_miner',
  contentId: 'dm_800',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_DM_500: BannerCreative = {
  id: 'DM_500',
  size: '500x80',
  imageSrc: dm500Img,
  altKey: 'promotions.banners.donatMiner',
  campaign: 'donat_miner',
  contentId: 'dm_500',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_DM_320: BannerCreative = {
  id: 'DM_320',
  size: '320x165',
  imageSrc: dm320Img,
  altKey: 'promotions.banners.donatMiner',
  campaign: 'donat_miner',
  contentId: 'dm_320',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_POINT_320: BannerCreative = {
  id: 'Point_320',
  size: '320x165',
  imageSrc: point320Img,
  altKey: 'promotions.banners.pointaucPromo',
  campaign: 'pointauc_promo',
  contentId: 'point_320',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_WORD_320: BannerCreative = {
  id: 'Word_320',
  size: '320x165',
  imageSrc: word320Img,
  altKey: 'promotions.banners.wordWidget',
  campaign: 'word_widget',
  contentId: 'word_320',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_WORD_320_2: BannerCreative = {
  id: 'Word_320_2',
  size: '320x165',
  imageSrc: word3202Img,
  altKey: 'promotions.banners.word320_2',
  campaign: 'word_widget',
  contentId: 'word_320_2',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_POINT_260: BannerCreative = {
  id: 'Point_260',
  size: '260x400',
  imageSrc: point2602Img,
  altKey: 'promotions.banners.pointaucPromo',
  campaign: 'pointauc_promo',
  contentId: 'point_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_WORD_260: BannerCreative = {
  id: 'Word_260',
  size: '260x400',
  imageSrc: word260Img,
  altKey: 'promotions.banners.wordWidget',
  campaign: 'word_widget',
  contentId: 'word_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_DM_260: BannerCreative = {
  id: 'DM_260',
  size: '260x400',
  imageSrc: dm260Img,
  altKey: 'promotions.banners.donatMiner',
  campaign: 'donat_miner',
  contentId: 'dm_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVE_MEMES_260: BannerCreative = {
  id: 'Memes_260',
  size: '260x400',
  imageSrc: memes260Img,
  altKey: 'promotions.banners.memesWidget',
  campaign: 'memes_widget',
  contentId: 'memes_260',
  partner: 'ihaq',
};

export const BANNER_CREATIVES: BannerCreative[] = [
  BANNER_CREATIVE_DM_800,
  BANNER_CREATIVE_DM_500,
  BANNER_CREATIVE_DM_320,
  BANNER_CREATIVE_POINT_320,
  BANNER_CREATIVE_WORD_320,
  BANNER_CREATIVE_WORD_320_2,
  BANNER_CREATIVE_POINT_260,
  BANNER_CREATIVE_WORD_260,
  BANNER_CREATIVE_DM_260,
  BANNER_CREATIVE_MEMES_260,
];

export const BANNER_CREATIVES_BY_SIZE: Record<BannerSize, BannerCreative[]> = {
  '800x110': [BANNER_CREATIVE_DM_800],
  '500x80': [BANNER_CREATIVE_DM_500],
  '320x165': [
    BANNER_CREATIVE_DM_320,
    BANNER_CREATIVE_POINT_320,
    BANNER_CREATIVE_WORD_320,
    BANNER_CREATIVE_WORD_320_2,
  ],
  '260x400': [
    BANNER_CREATIVE_POINT_260,
    BANNER_CREATIVE_WORD_260,
    BANNER_CREATIVE_DM_260,
    BANNER_CREATIVE_MEMES_260,
  ],
};

export const BANNER_CREATIVES_BY_ID: Record<string, BannerCreative> = {
  [BANNER_CREATIVE_DM_800.id]: BANNER_CREATIVE_DM_800,
  [BANNER_CREATIVE_DM_500.id]: BANNER_CREATIVE_DM_500,
  [BANNER_CREATIVE_DM_320.id]: BANNER_CREATIVE_DM_320,
  [BANNER_CREATIVE_POINT_320.id]: BANNER_CREATIVE_POINT_320,
  [BANNER_CREATIVE_WORD_320.id]: BANNER_CREATIVE_WORD_320,
  [BANNER_CREATIVE_WORD_320_2.id]: BANNER_CREATIVE_WORD_320_2,
  [BANNER_CREATIVE_POINT_260.id]: BANNER_CREATIVE_POINT_260,
  [BANNER_CREATIVE_WORD_260.id]: BANNER_CREATIVE_WORD_260,
  [BANNER_CREATIVE_DM_260.id]: BANNER_CREATIVE_DM_260,
  [BANNER_CREATIVE_MEMES_260.id]: BANNER_CREATIVE_MEMES_260,
};
