// Kinopoisk page scraping provider implementation.
import { getJsonLdByType } from '@domains/links/participant-url-parsing/shared/jsonLd';
import { scrapeHtmlPage } from '@domains/links/participant-url-parsing/shared/providers/scrape';
import {
  getNumericValue,
  getRuntimeMinutesFromIsoDuration,
  getYearFromDate,
} from '@domains/links/participant-url-parsing/shared/valueParsers';
import { buildKinopoiskMovieUrl } from '@domains/links/participant-url-parsing/sources/kinopoisk/helpers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromKinopoiskPageParams {
  kinopoiskMovieId: string;
  kinopoiskUrl: string;
  signal?: AbortSignal;
}

const stripTitleSuffix = (value: string): string => {
  return value.replace(/\s*[-\u2014]\s*\u041a\u0438\u043d\u043e\u043f\u043e\u0438\u0441\u043a.*$/i, '').trim();
};

const decodeHtmlEntities = (value: string): string => {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const extractMetaContent = (html: string, attributeName: string, attributeValue: string): string | null => {
  const escapedAttributeValue = attributeValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const contentAfterAttributeMatch = html.match(
    new RegExp(
      `<meta[^>]*${attributeName}=["']${escapedAttributeValue}["'][^>]*content=(["'])([\\s\\S]*?)\\1[^>]*>`,
      'i',
    ),
  );
  if (contentAfterAttributeMatch?.[2]) {
    return decodeHtmlEntities(contentAfterAttributeMatch[2].trim());
  }

  const contentBeforeAttributeMatch = html.match(
    new RegExp(
      `<meta[^>]*content=(["'])([\\s\\S]*?)\\1[^>]*${attributeName}=["']${escapedAttributeValue}["'][^>]*>`,
      'i',
    ),
  );
  if (contentBeforeAttributeMatch?.[2]) {
    return decodeHtmlEntities(contentBeforeAttributeMatch[2].trim());
  }

  return null;
};

const extractHtmlTitle = (html: string): string | null => {
  const openGraphTitle = extractMetaContent(html, 'property', 'og:title');
  if (openGraphTitle) {
    return stripTitleSuffix(openGraphTitle);
  }

  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleTagMatch?.[1]) {
    return null;
  }

  return stripTitleSuffix(decodeHtmlEntities(titleTagMatch[1].trim()));
};

const extractYearFromTitle = (title: string | null): number | null => {
  if (!title) {
    return null;
  }

  const yearMatch = title.match(/\((\d{4})\)/);
  return getNumericValue(yearMatch?.[1]);
};

const extractRuntimeMinutesFromLocalizedText = (html: string): number | null => {
  const hoursAndMinutesMatch = html.match(
    /(\d+)\s*\u0447(?:\u0430\u0441(?:\u0430|\u043e\u0432)?)?\s*(\d+)\s*\u043c\u0438\u043d/i,
  );
  if (hoursAndMinutesMatch) {
    const hours = Number(hoursAndMinutesMatch[1]);
    const minutes = Number(hoursAndMinutesMatch[2]);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes > 0 ? totalMinutes : null;
  }

  const minutesOnlyMatch = html.match(/(\d+)\s*\u043c\u0438\u043d/i);
  if (!minutesOnlyMatch) {
    return null;
  }

  const minutes = Number(minutesOnlyMatch[1]);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
};

const extractRatingFromHtml = (html: string): number | null => {
  const jsonLdRatingMatch = html.match(/"ratingValue"\s*:\s*"?([\d.,]+)"?/i);
  if (jsonLdRatingMatch?.[1]) {
    return getNumericValue(jsonLdRatingMatch[1].replace(',', '.'));
  }

  const itemPropRatingMatch = html.match(/itemprop=["']ratingValue["'][^>]*>\s*([\d.,]+)\s*</i);
  if (!itemPropRatingMatch?.[1]) {
    return null;
  }

  return getNumericValue(itemPropRatingMatch[1].replace(',', '.'));
};

export const getMovieMetadataFromKinopoiskPage = async (
  params: GetMovieMetadataFromKinopoiskPageParams,
): Promise<ParticipantUrlMovieMetadata> => {
  const kinopoiskUrl = params.kinopoiskUrl || buildKinopoiskMovieUrl(params.kinopoiskMovieId);

  const html = await scrapeHtmlPage({
    url: kinopoiskUrl,
    signal: params.signal,
  });

  const movie = getJsonLdByType(html, 'Movie');
  const parsedTitle = movie?.name ? stripTitleSuffix(movie.name) : null;
  const fallbackTitle = extractHtmlTitle(html);
  const title = parsedTitle || fallbackTitle;

  if (!title) {
    throw new Error(`Kinopoisk page scraping did not find movie metadata for ${params.kinopoiskMovieId}.`);
  }

  const year = getYearFromDate(movie?.datePublished) ?? extractYearFromTitle(parsedTitle) ?? extractYearFromTitle(fallbackTitle);
  const runtimeMinutes =
    getRuntimeMinutesFromIsoDuration(movie?.duration) ?? extractRuntimeMinutesFromLocalizedText(html);
  const rating = getNumericValue(movie?.aggregateRating?.ratingValue) ?? extractRatingFromHtml(html);

  return {
    kind: 'movie',
    imdbTitleId: params.kinopoiskMovieId,
    title,
    year,
    runtimeMinutes,
    rating,
    source: 'kinopoisk',
    provider: 'kinopoisk-scrape',
    sourceUrl: kinopoiskUrl,
  };
};
