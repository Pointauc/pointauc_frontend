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

/**
 * Normalizes the base banner URL to ensure directory paths have a trailing slash.
 * Upstream reverse proxies (such as Nginx / OpenResty) often perform canonicalization
 * 301 redirects when a path lacks a trailing slash. If their internal proxy pass forwards
 * to an internal port (e.g. :3000), those redirects may inadvertently expose the internal
 * port and break the redirect in production. Ensuring a trailing slash here prevents this.
 */
export const normalizeBannerBaseUrl = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    const lastSegment = url.pathname.split('/').filter(Boolean).pop() ?? '';
    if (!url.pathname.endsWith('/') && !lastSegment.includes('.')) {
      url.pathname = `${url.pathname}/`;
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
};

export const buildBannerUrl = ({
  placement,
  creative,
  page,
  baseUrl = DEFAULT_BASE_URL,
  utmSource = DEFAULT_UTM_SOURCE,
}: BuildBannerUrlParams): string => {
  const normalizedBase = normalizeBannerBaseUrl(baseUrl);
  const url = new URL(normalizedBase);

  url.searchParams.set('utm_source', sanitizeUtmValue(utmSource));
  url.searchParams.set('utm_medium', 'banner');
  url.searchParams.set('utm_campaign', sanitizeUtmValue(creative.campaign));
  url.searchParams.set('utm_content', sanitizeUtmValue(`${placement}_${creative.contentId}`));
  url.searchParams.set('utm_term', sanitizeUtmValue(page));

  return url.toString();
};
