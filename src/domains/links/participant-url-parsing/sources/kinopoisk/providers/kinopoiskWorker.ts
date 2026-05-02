import { getNumericValue } from '@domains/links/participant-url-parsing/shared/valueParsers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromKinopoiskWorkerParams {
  kinopoiskMovieId: string;
  kinopoiskUrl: string;
  signal?: AbortSignal;
}

interface KinopoiskWorkerMetadataResponse {
  kinopoiskMovieId?: string;
  title?: string;
  year?: number | null;
  runtimeMinutes?: number | null;
  rating?: number | null;
  sourceUrl?: string;
}

const KINOPOISK_METADATA_WORKER_URL = import.meta.env.VITE_KINOPOISK_METADATA_WORKER_URL;

export const getMovieMetadataFromKinopoiskWorker = async (
  params: GetMovieMetadataFromKinopoiskWorkerParams,
): Promise<ParticipantUrlMovieMetadata> => {
  if (!KINOPOISK_METADATA_WORKER_URL) {
    throw new Error('Kinopoisk worker provider is not configured: VITE_KINOPOISK_METADATA_WORKER_URL is missing.');
  }

  const kinopoiskTitleType = params.kinopoiskUrl.includes('/series/') ? 'series' : 'film';
  const workerUrl = `${KINOPOISK_METADATA_WORKER_URL.replace(/\/$/, '')}/api/metadata/kinopoisk/${kinopoiskTitleType}/${params.kinopoiskMovieId}`;
  const response = await fetch(workerUrl, {
    method: 'GET',
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error(`Kinopoisk worker request failed for ${params.kinopoiskMovieId} with status ${response.status}.`);
  }

  const payload = (await response.json()) as KinopoiskWorkerMetadataResponse;

  if (!payload.title) {
    throw new Error(`Kinopoisk worker did not return title for ${params.kinopoiskMovieId}.`);
  }

  return {
    kind: 'movie',
    imdbTitleId: params.kinopoiskMovieId,
    title: payload.title.trim(),
    year: getNumericValue(payload.year),
    runtimeMinutes: getNumericValue(payload.runtimeMinutes),
    rating: getNumericValue(payload.rating),
    source: 'kinopoisk',
    provider: 'kinopoisk-worker',
    sourceUrl: payload.sourceUrl || params.kinopoiskUrl,
  };
};
