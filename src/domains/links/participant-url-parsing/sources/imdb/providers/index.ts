// Provider fallback chain for IMDb metadata loading.
import { getMovieMetadataFromImdbPage } from '@domains/links/participant-url-parsing/sources/imdb/providers/imdbScrape';
import { getMovieMetadataFromTmdb } from '@domains/links/participant-url-parsing/sources/imdb/providers/tmdb';
import { getMovieMetadataFromWikidata } from '@domains/links/participant-url-parsing/sources/imdb/providers/wikidata';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetImdbMovieMetadataParams {
  imdbTitleId: string;
  imdbUrl: string;
  signal?: AbortSignal;
}

type ProviderLoader = (params: GetImdbMovieMetadataParams) => Promise<ParticipantUrlMovieMetadata>;

const providerLoaders: ProviderLoader[] = [getMovieMetadataFromWikidata, getMovieMetadataFromTmdb, getMovieMetadataFromImdbPage];

export const getImdbMovieMetadataWithFallback = async (
  params: GetImdbMovieMetadataParams,
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
