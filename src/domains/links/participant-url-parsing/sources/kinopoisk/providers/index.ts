// Provider fallback chain for Kinopoisk metadata loading.
import { getMovieMetadataFromKinopoiskWorker } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers/kinopoiskWorker';
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
  getMovieMetadataFromKinopoiskWorker,
  getMovieMetadataFromTmdb,
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
