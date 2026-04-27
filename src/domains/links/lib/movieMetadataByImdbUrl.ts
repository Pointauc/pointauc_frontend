import {
  getMovieMetadataFromImdbPage,
  getMovieMetadataFromTmdb,
  getMovieMetadataFromWikidata,
  type GetMovieMetadataParams,
  type GetTmdbMovieMetadataParams,
  type RetrievedMovieMetadata,
} from '@domains/links/lib/movieMetadata';

export interface GetMovieMetadataByImdbUrlParams extends Omit<GetMovieMetadataParams, 'imdbTitleId'> {
  imdbUrl: string;
}

export interface GetTmdbMovieMetadataByImdbUrlParams
  extends Omit<GetTmdbMovieMetadataParams, 'imdbTitleId' | 'imdbUrl'> {
  imdbUrl: string;
}

export interface GetMovieMetadataFromAllSourcesByImdbUrlParams extends GetMovieMetadataByImdbUrlParams {
  tmdbApiKey: string;
  tmdbLanguage?: string;
}

export interface RetrievedMovieMetadataFromAllSources {
  tmdb: RetrievedMovieMetadata | null;
  wikidata: RetrievedMovieMetadata | null;
  imdbScrape: RetrievedMovieMetadata | null;
}

/**
 * Fetches movie metadata from TMDb using only an IMDb title URL as input.
 */
export const getMovieMetadataFromTmdbByImdbUrl = async (
  params: GetTmdbMovieMetadataByImdbUrlParams,
): Promise<RetrievedMovieMetadata> => {
  return getMovieMetadataFromTmdb({
    imdbUrl: params.imdbUrl,
    apiKey: params.apiKey,
    language: params.language,
    fetchFn: params.fetchFn,
    signal: params.signal,
  });
};

/**
 * Fetches movie metadata from Wikidata using only an IMDb title URL as input.
 */
export const getMovieMetadataFromWikidataByImdbUrl = async (
  params: GetMovieMetadataByImdbUrlParams,
): Promise<RetrievedMovieMetadata> => {
  return getMovieMetadataFromWikidata({
    imdbUrl: params.imdbUrl,
    fetchFn: params.fetchFn,
    signal: params.signal,
  });
};

/**
 * Fetches movie metadata by scraping the IMDb title page using only an IMDb URL as input.
 */
export const getMovieMetadataFromImdbPageByImdbUrl = async (
  params: GetMovieMetadataByImdbUrlParams,
): Promise<RetrievedMovieMetadata> => {
  return getMovieMetadataFromImdbPage({
    imdbUrl: params.imdbUrl,
    fetchFn: params.fetchFn,
    signal: params.signal,
  });
};

const getSettledValue = async <T>(promise: Promise<T>): Promise<T | null> => {
  try {
    return await promise;
  } catch {
    return null;
  }
};

/**
 * Fetches movie metadata from all supported sources in parallel using only an IMDb URL.
 */
export const getMovieMetadataFromAllSourcesByImdbUrl = async (
  params: GetMovieMetadataFromAllSourcesByImdbUrlParams,
): Promise<RetrievedMovieMetadataFromAllSources> => {
  const { imdbUrl, tmdbApiKey, tmdbLanguage, fetchFn, signal } = params;

  const [tmdb, wikidata, imdbScrape] = await Promise.all([
    getSettledValue(
      getMovieMetadataFromTmdbByImdbUrl({
        imdbUrl,
        apiKey: tmdbApiKey,
        language: tmdbLanguage,
        fetchFn,
        signal,
      }),
    ),
    getSettledValue(
      getMovieMetadataFromWikidataByImdbUrl({
        imdbUrl,
        fetchFn,
        signal,
      }),
    ),
    getSettledValue(
      getMovieMetadataFromImdbPageByImdbUrl({
        imdbUrl,
        fetchFn,
        signal,
      }),
    ),
  ]);

  return {
    tmdb,
    wikidata,
    imdbScrape,
  };
};
