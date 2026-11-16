import { describe, expect, it } from 'vitest';

import { BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260 } from '@domains/promotions/config/bannerRegistry';

import { buildBannerUrl, normalizeBannerBaseUrl, sanitizeUtmValue } from './buildBannerUrl';

describe('buildBannerUrl', () => {
  describe('normalizeBannerBaseUrl', () => {
    it('appends a trailing slash to paths without one to prevent upstream redirects to port 3000', () => {
      expect(normalizeBannerBaseUrl('https://ihaqdonate.com/donatnoe-nebo')).toBe(
        'https://ihaqdonate.com/donatnoe-nebo/',
      );
    });

    it('keeps existing trailing slash unchanged', () => {
      expect(normalizeBannerBaseUrl('https://ihaqdonate.com/donatnoe-nebo/')).toBe(
        'https://ihaqdonate.com/donatnoe-nebo/',
      );
    });

    it('keeps root url with slash intact', () => {
      expect(normalizeBannerBaseUrl('https://ihaqdonate.com/')).toBe('https://ihaqdonate.com/');
    });

    it('keeps URLs with file extensions unchanged', () => {
      expect(normalizeBannerBaseUrl('https://ihaqdonate.com/promo.html')).toBe(
        'https://ihaqdonate.com/promo.html',
      );
    });
  });

  describe('sanitizeUtmValue', () => {
    it('lowercases and replaces invalid characters with underscores', () => {
      expect(sanitizeUtmValue('Promo_123!@#')).toBe('promo_123___');
    });
  });

  describe('buildBannerUrl', () => {
    it('constructs url with trailing slash before query params avoiding partner 301 redirect', () => {
      const url = buildBannerUrl({
        placement: 'auction_bids',
        creative: BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260,
        page: 'auction',
        baseUrl: 'https://ihaqdonate.com/donatnoe-nebo',
      });

      expect(url).toBe(
        'https://ihaqdonate.com/donatnoe-nebo/?utm_source=pointauc&utm_medium=banner&utm_campaign=donatnoe_nebo&utm_content=auction_bids_donatnoe_nebo_streamer_260&utm_term=auction',
      );
    });

    it('uses DEFAULT_BASE_URL when baseUrl is omitted', () => {
      const url = buildBannerUrl({
        placement: 'auction_bids',
        creative: BANNER_CREATIVE_DONATNOE_NEBO_STREAMER_260,
        page: 'auction',
      });

      expect(url).toContain('https://ihaqdonate.com/donatnoe-nebo/?');
      expect(url).toContain('utm_source=pointauc');
      expect(url).toContain('utm_medium=banner');
      expect(url).toContain('utm_campaign=donatnoe_nebo');
      expect(url).toContain('utm_content=auction_bids_donatnoe_nebo_streamer_260');
      expect(url).toContain('utm_term=auction');
    });
  });
});
