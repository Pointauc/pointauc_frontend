// Shared TMDb client provider (can be reused by multiple sources).
import axios from 'axios';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

interface TmdbFindResponse {
  movie_results?: {
    id: number;
    title?: string;
    original_title?: string;
    release_date?: string;
    vote_average?: number;
  }[];
}

interface TmdbMovieDetailsResponse {
  title?: string;
  original_title?: string;
  release_date?: string;
  runtime?: number | null;
  vote_average?: number;
}

interface TmdbBaseParams {
  apiKey: string;
  language?: string;
  signal?: AbortSignal;
}

export interface TmdbFindMovieParams extends TmdbBaseParams {
  externalId: string;
  externalSource: string;
}

export interface TmdbFindMovieResult {
  id: number;
  title?: string;
  originalTitle?: string;
  releaseDate?: string;
  voteAverage?: number;
}

export interface TmdbMovieDetailsParams extends TmdbBaseParams {
  movieId: number;
}

export interface TmdbMovieDetailsResult {
  title?: string;
  originalTitle?: string;
  releaseDate?: string;
  runtime?: number | null;
  voteAverage?: number;
  sourceUrl: string;
}

export const findTmdbMovieByExternalId = async (params: TmdbFindMovieParams): Promise<TmdbFindMovieResult | null> => {
  const language = params.language ?? 'en-US';
  const { data: findData } = await axios.get<TmdbFindResponse>(`${TMDB_API_BASE_URL}/find/${params.externalId}`, {
    params: {
      api_key: params.apiKey,
      external_source: params.externalSource,
      language,
    },
    headers: {
      Accept: 'application/json',
    },
    signal: params.signal,
  });

  const matchedMovie = findData.movie_results?.[0];
  if (!matchedMovie?.id) {
    return null;
  }

  return {
    id: matchedMovie.id,
    title: matchedMovie.title,
    originalTitle: matchedMovie.original_title,
    releaseDate: matchedMovie.release_date,
    voteAverage: matchedMovie.vote_average,
  };
};

export const getTmdbMovieDetails = async (params: TmdbMovieDetailsParams): Promise<TmdbMovieDetailsResult> => {
  const language = params.language ?? 'en-US';
  const detailsUrl = new URL(`${TMDB_API_BASE_URL}/movie/${params.movieId}`);
  const { data: detailsData } = await axios.get<TmdbMovieDetailsResponse>(detailsUrl.toString(), {
    params: {
      api_key: params.apiKey,
      language,
    },
    headers: {
      Accept: 'application/json',
    },
    signal: params.signal,
  });

  return {
    title: detailsData.title,
    originalTitle: detailsData.original_title,
    releaseDate: detailsData.release_date,
    runtime: detailsData.runtime,
    voteAverage: detailsData.vote_average,
    sourceUrl: detailsUrl.toString(),
  };
};
