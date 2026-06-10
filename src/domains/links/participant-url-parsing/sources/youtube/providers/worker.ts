import { getMetadataWorkerUrl } from '@domains/links/participant-url-parsing/shared/metadataWorker';
import { buildYoutubeVideoUrl } from '@domains/links/participant-url-parsing/sources/youtube/helpers';

import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

interface GetYoutubeVideoRequestMetadataFromWorkerParams {
  videoId: string;
  signal?: AbortSignal;
}

export const getYoutubeVideoRequestMetadataFromWorker = async (
  params: GetYoutubeVideoRequestMetadataFromWorkerParams,
): Promise<ParticipantUrlVideoRequestMetadata> => {
  const requestUrl = new URL(getMetadataWorkerUrl('/api/metadata/video-request'));
  requestUrl.searchParams.set('url', buildYoutubeVideoUrl(params.videoId));

  const response = await fetch(requestUrl, {
    method: 'GET',
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error(`YouTube metadata worker request failed with status ${response.status}.`);
  }

  return (await response.json()) as ParticipantUrlVideoRequestMetadata;
};
