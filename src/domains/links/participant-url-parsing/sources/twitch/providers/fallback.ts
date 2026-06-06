import {
  buildTwitchClipEmbedUrl,
  buildTwitchClipUrl,
  buildTwitchVideoEmbedUrl,
  buildTwitchVideoUrl,
  getTwitchParentHost,
  type TwitchVideoRequestReference,
} from '@domains/links/participant-url-parsing/sources/twitch/helpers';

import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

interface GetTwitchVideoRequestFallbackMetadataParams {
  reference: TwitchVideoRequestReference;
  parentHost?: string;
}

export const getTwitchVideoRequestFallbackMetadata = (
  params: GetTwitchVideoRequestFallbackMetadataParams,
): ParticipantUrlVideoRequestMetadata => {
  const parentHost = getTwitchParentHost(params.parentHost);

  if (params.reference.kind === 'clip') {
    return {
      source: 'twitch',
      provider: 'twitch-url-fallback',
      canonicalUrl: buildTwitchClipUrl(params.reference.slug),
      player: {
        kind: 'iframe',
        embedUrl: buildTwitchClipEmbedUrl(params.reference.slug, parentHost ?? undefined),
        parentHost,
      },
      title: 'Twitch clip',
      channelName: params.reference.channelName,
      thumbnailUrl: null,
      durationSeconds: null,
      viewCount: null,
      likeCount: null,
      publishedAt: null,
      createdAt: null,
      sourceReference: {
        kind: params.reference.kind,
        slug: params.reference.slug,
        channelName: params.reference.channelName,
      },
    };
  }

  return {
    source: 'twitch',
    provider: 'twitch-url-fallback',
    canonicalUrl: buildTwitchVideoUrl(params.reference.videoId, params.reference.startsAtSeconds),
    player: {
      kind: 'iframe',
      embedUrl: buildTwitchVideoEmbedUrl(params.reference.videoId, params.reference.startsAtSeconds, parentHost ?? undefined),
      parentHost,
    },
    title: 'Twitch video',
    channelName: null,
    thumbnailUrl: null,
    durationSeconds: null,
    viewCount: null,
    likeCount: null,
    publishedAt: null,
    createdAt: null,
    sourceReference: {
      kind: params.reference.kind,
      videoId: params.reference.videoId,
      startsAtSeconds: params.reference.startsAtSeconds,
    },
  };
};
