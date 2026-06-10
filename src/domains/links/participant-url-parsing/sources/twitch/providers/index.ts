import { getTwitchVideoRequestFallbackMetadata } from '@domains/links/participant-url-parsing/sources/twitch/providers/fallback';
import { getTwitchVideoRequestMetadataFromWorker } from '@domains/links/participant-url-parsing/sources/twitch/providers/worker';

import type { TwitchVideoRequestReference } from '@domains/links/participant-url-parsing/sources/twitch/helpers';
import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

interface GetTwitchVideoRequestMetadataParams {
  reference: TwitchVideoRequestReference;
  parentHost?: string;
  signal?: AbortSignal;
}

export const getTwitchVideoRequestMetadataWithFallback = async (
  params: GetTwitchVideoRequestMetadataParams,
): Promise<ParticipantUrlVideoRequestMetadata> => {
  try {
    return await getTwitchVideoRequestMetadataFromWorker(params);
  } catch {
    return getTwitchVideoRequestFallbackMetadata(params);
  }
};
