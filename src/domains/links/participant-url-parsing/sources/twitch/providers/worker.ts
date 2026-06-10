import {
  buildTwitchClipEmbedUrl,
  buildTwitchClipUrl,
  buildTwitchVideoEmbedUrl,
  buildTwitchVideoUrl,
  getTwitchParentHost,
  type TwitchVideoRequestReference,
} from '@domains/links/participant-url-parsing/sources/twitch/helpers';
import { getMetadataWorkerUrl } from '@domains/links/participant-url-parsing/shared/metadataWorker';

import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

interface GetTwitchVideoRequestWorkerMetadataParams {
  reference: TwitchVideoRequestReference;
  parentHost?: string;
  signal?: AbortSignal;
}

const getReferenceUrl = (reference: TwitchVideoRequestReference): string => {
  if (reference.kind === 'clip') {
    return buildTwitchClipUrl(reference.slug);
  }

  return buildTwitchVideoUrl(reference.videoId, reference.startsAtSeconds);
};

const normalizeTwitchWorkerMetadata = (
  metadata: ParticipantUrlVideoRequestMetadata,
  reference: TwitchVideoRequestReference,
  parentHost: string | null,
): ParticipantUrlVideoRequestMetadata => {
  if (reference.kind === 'clip') {
    return {
      ...metadata,
      player: {
        kind: 'iframe',
        embedUrl: buildTwitchClipEmbedUrl(reference.slug, parentHost ?? undefined),
        parentHost,
      },
    };
  }

  return {
    ...metadata,
    player: {
      kind: 'iframe',
      embedUrl: buildTwitchVideoEmbedUrl(reference.videoId, reference.startsAtSeconds, parentHost ?? undefined),
      parentHost,
    },
  };
};

export const getTwitchVideoRequestMetadataFromWorker = async (
  params: GetTwitchVideoRequestWorkerMetadataParams,
): Promise<ParticipantUrlVideoRequestMetadata> => {
  const parentHost = getTwitchParentHost(params.parentHost);
  const requestUrl = new URL(getMetadataWorkerUrl('/api/metadata/video-request'));

  requestUrl.searchParams.set('url', getReferenceUrl(params.reference));
  if (parentHost) {
    requestUrl.searchParams.set('parentHost', parentHost);
  }

  const response = await fetch(requestUrl, {
    method: 'GET',
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error(`Twitch metadata worker request failed with status ${response.status}.`);
  }

  return normalizeTwitchWorkerMetadata((await response.json()) as ParticipantUrlVideoRequestMetadata, params.reference, parentHost);
};
