import { getMovieMetadataFromImdbPage as getMovieMetadataFromImdbPageProvider } from '@domains/links/participant-url-parsing/sources/imdb/providers/imdbScrape';
import { getMovieMetadataFromTmdb as getMovieMetadataFromTmdbProvider } from '@domains/links/participant-url-parsing/sources/imdb/providers/tmdb';
import { getMovieMetadataFromWikidata as getMovieMetadataFromWikidataProvider } from '@domains/links/participant-url-parsing/sources/imdb/providers/wikidata';
import { buildImdbTitleUrl, extractImdbTitleId } from '@domains/links/participant-url-parsing/sources/imdb/helpers';

import type { ParsedLotLink } from '@domains/links/lib/lotNameLink';
import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

export type MovieMetadataSource = 'tmdb' | 'wikidata' | 'imdb-scrape';

export interface RetrievedMovieMetadata {
  imdbTitleId: string;
  title: string;
  year: number | null;
  runtimeMinutes: number | null;
  rating: number | null;
  source: MovieMetadataSource;
  sourceUrl: string;
}

export interface GetMovieMetadataParams {
  imdbTitleId?: string | null;
  imdbUrl?: string | null;
  signal?: AbortSignal;
}

export interface GetTmdbMovieMetadataParams extends GetMovieMetadataParams {
  apiKey: string;
  language?: string;
}

const resolveImdbTitleId = (params: GetMovieMetadataParams): string => {
  const imdbTitleId = extractImdbTitleId(params.imdbTitleId) ?? extractImdbTitleId(params.imdbUrl);

  if (!imdbTitleId) {
    throw new Error('Failed to resolve an IMDb title identifier from the provided input.');
  }

  return imdbTitleId;
};

const mapSource = (provider: string): MovieMetadataSource => {
  if (provider === 'tmdb') {
    return 'tmdb';
  }

  if (provider === 'wikidata') {
    return 'wikidata';
  }

  return 'imdb-scrape';
};

const mapRetrievedMovieMetadata = (metadata: ParticipantUrlMovieMetadata): RetrievedMovieMetadata => {
  return {
    imdbTitleId: metadata.imdbTitleId,
    title: metadata.title,
    year: metadata.year,
    runtimeMinutes: metadata.runtimeMinutes,
    rating: metadata.rating,
    source: mapSource(metadata.provider),
    sourceUrl: metadata.sourceUrl,
  };
};

export const extractImdbTitleIdFromLotLink = (lotLink: ParsedLotLink | null): string | null => {
  if (!lotLink) {
    return null;
  }

  return extractImdbTitleId(lotLink.href) ?? extractImdbTitleId(lotLink.url);
};

export const getMovieMetadataFromTmdb = async (
  params: GetTmdbMovieMetadataParams,
): Promise<RetrievedMovieMetadata> => {
  const metadata = await getMovieMetadataFromTmdbProvider({
    imdbTitleId: resolveImdbTitleId(params),
    apiKey: params.apiKey,
    language: params.language,
    signal: params.signal,
  });

  return mapRetrievedMovieMetadata(metadata);
};

export const getMovieMetadataFromWikidata = async (params: GetMovieMetadataParams): Promise<RetrievedMovieMetadata> => {
  const metadata = await getMovieMetadataFromWikidataProvider({
    imdbTitleId: resolveImdbTitleId(params),
    signal: params.signal,
  });

  return mapRetrievedMovieMetadata(metadata);
};

export const getMovieMetadataFromImdbPage = async (params: GetMovieMetadataParams): Promise<RetrievedMovieMetadata> => {
  const imdbTitleId = resolveImdbTitleId(params);
  const metadata = await getMovieMetadataFromImdbPageProvider({
    imdbTitleId,
    imdbUrl: params.imdbUrl ?? buildImdbTitleUrl(imdbTitleId),
    signal: params.signal,
  });

  return mapRetrievedMovieMetadata(metadata);
};

export { buildImdbTitleUrl, extractImdbTitleId };
