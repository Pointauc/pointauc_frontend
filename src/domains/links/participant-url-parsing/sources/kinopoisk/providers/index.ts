// Provider fallback chain for Kinopoisk metadata loading.
import { getMovieMetadataFromKinopoiskPage } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers/kinopoiskScrape';
import { getMovieMetadataFromTmdb } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers/tmdb';
import { getMovieMetadataFromWikidata } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers/wikidata';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetKinopoiskMovieMetadataParams {
  kinopoiskMovieId: string;
  kinopoiskUrl: string;
  signal?: AbortSignal;
}

type ProviderLoader = (params: GetKinopoiskMovieMetadataParams) => Promise<ParticipantUrlMovieMetadata>;

const providerLoaders: ProviderLoader[] = [
  getMovieMetadataFromWikidata,
  getMovieMetadataFromTmdb,
  getMovieMetadataFromKinopoiskPage,
];

export const getKinopoiskMovieMetadataWithFallback = async (
  params: GetKinopoiskMovieMetadataParams,
): Promise<ParticipantUrlMovieMetadata | null> => {
  for (const providerLoader of providerLoaders) {
    try {
      return await providerLoader(params);
    } catch {
      continue;
    }
  }

  return null;
};
