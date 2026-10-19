import { DEFAULT_BASE_URL, DEFAULT_UTM_SOURCE } from '@domains/promotions/config/bannerConfig';
import { BannerCreative, BannerPage, BannerPlacement } from '@domains/promotions/model/types';

export interface BuildBannerUrlParams {
  placement: BannerPlacement;
  creative: BannerCreative;
  page: BannerPage;
  baseUrl?: string;
  utmSource?: string;
}

/**
 * Sanitizes UTM parameter values strictly following partner guidelines:
 * - lowercase latin letters (a-z)
 * - digits (0-9)
 * - hyphens (-) and underscores (_)
 * - maximum 255 characters
 */
export const sanitizeUtmValue = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '_')
    .slice(0, 255);
};

export const buildBannerUrl = ({
  placement,
  creative,
  page,
  baseUrl = DEFAULT_BASE_URL,
  utmSource = DEFAULT_UTM_SOURCE,
}: BuildBannerUrlParams): string => {
  const url = new URL(baseUrl);

  url.searchParams.set('utm_source', sanitizeUtmValue(utmSource));
  url.searchParams.set('utm_medium', 'banner');
  url.searchParams.set('utm_campaign', sanitizeUtmValue(creative.campaign));
  url.searchParams.set('utm_content', sanitizeUtmValue(`${placement}_${creative.contentId}`));
  url.searchParams.set('utm_term', sanitizeUtmValue(page));

  return url.toString();
};
