// Kinopoisk metadata resolver via TMDb and Wikidata cross-reference.
import {
  findTmdbMovieByExternalId,
  getTmdbMovieDetails,
} from '@domains/links/participant-url-parsing/shared/providers/tmdb';
import { getNumericValue, getYearFromDate } from '@domains/links/participant-url-parsing/shared/valueParsers';
import { getWikidataEntityIdByKinopoiskMovieId } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers/wikidata';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromTmdbParams {
  kinopoiskMovieId: string;
  apiKey?: string;
  language?: string;
  signal?: AbortSignal;
}

const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY?.trim() ?? '';

export const getMovieMetadataFromTmdb = async (
  params: GetMovieMetadataFromTmdbParams,
): Promise<ParticipantUrlMovieMetadata> => {
  const resolvedApiKey = params.apiKey ?? tmdbApiKey;
  if (!resolvedApiKey) {
    throw new Error('TMDb provider is not configured: VITE_TMDB_API_KEY is missing.');
  }

  const { wikidataEntityId, imdbTitleId } = await getWikidataEntityIdByKinopoiskMovieId({
    kinopoiskMovieId: params.kinopoiskMovieId,
    signal: params.signal,
  });

  const matchedMovie = await findTmdbMovieByExternalId({
    apiKey: resolvedApiKey,
    externalId: wikidataEntityId,
    externalSource: 'wikidata_id',
    language: params.language,
    signal: params.signal,
  });

  if (!matchedMovie?.id) {
    throw new Error(`TMDb did not return a movie match for Kinopoisk movie ${params.kinopoiskMovieId}.`);
  }

  const details = await getTmdbMovieDetails({
    apiKey: resolvedApiKey,
    movieId: matchedMovie.id,
    language: params.language,
    signal: params.signal,
  });

  const title = details.title ?? details.originalTitle ?? matchedMovie.title ?? matchedMovie.originalTitle;
  if (!title) {
    throw new Error(`TMDb did not provide a title for Kinopoisk movie ${params.kinopoiskMovieId}.`);
  }

  return {
    kind: 'movie',
    imdbTitleId: imdbTitleId ?? params.kinopoiskMovieId,
    title,
    year: getYearFromDate(details.releaseDate ?? matchedMovie.releaseDate),
    runtimeMinutes: getNumericValue(details.runtime),
    rating: getNumericValue(details.voteAverage ?? matchedMovie.voteAverage),
    source: 'kinopoisk',
    provider: 'tmdb',
    sourceUrl: details.sourceUrl,
  };
};
