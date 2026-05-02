// IMDb page scraping provider implementation.
import { getJsonLdByType } from '@domains/links/participant-url-parsing/shared/jsonLd';
import { scrapeHtmlPage } from '@domains/links/participant-url-parsing/shared/providers/scrape';
import {
  getNumericValue,
  getRuntimeMinutesFromIsoDuration,
  getYearFromDate,
} from '@domains/links/participant-url-parsing/shared/valueParsers';
import { buildImdbTitleUrl } from '@domains/links/participant-url-parsing/sources/imdb/helpers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromImdbPageParams {
  imdbTitleId: string;
  imdbUrl: string;
  signal?: AbortSignal;
}

export const getMovieMetadataFromImdbPage = async (
  params: GetMovieMetadataFromImdbPageParams,
): Promise<ParticipantUrlMovieMetadata> => {
  const imdbUrl = params.imdbUrl || buildImdbTitleUrl(params.imdbTitleId);

  const html = await scrapeHtmlPage({
    url: imdbUrl,
    signal: params.signal,
  });
  const movie = getJsonLdByType(html, 'Movie');

  if (!movie?.name) {
    throw new Error(`IMDb page scraping did not find movie metadata for ${params.imdbTitleId}.`);
  }

  return {
    kind: 'movie',
    imdbTitleId: params.imdbTitleId,
    title: movie.name,
    year: getYearFromDate(movie.datePublished),
    runtimeMinutes: getRuntimeMinutesFromIsoDuration(movie.duration),
    rating: getNumericValue(movie.aggregateRating?.ratingValue),
    source: 'imdb',
    provider: 'imdb-scrape',
    sourceUrl: imdbUrl,
  };
};
