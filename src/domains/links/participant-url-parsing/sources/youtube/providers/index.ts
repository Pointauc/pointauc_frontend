import { getYoutubeVideoRequestMetadataFromDataApi } from '@domains/links/participant-url-parsing/sources/youtube/providers/dataApi';
import { getYoutubeVideoMetadataFromOembed } from '@domains/links/participant-url-parsing/sources/youtube/providers/oembed';
import { getYoutubeVideoRequestMetadataFromWorker } from '@domains/links/participant-url-parsing/sources/youtube/providers/worker';
import {
  buildYoutubeEmbedUrl,
  buildYoutubeThumbnailUrl,
  buildYoutubeVideoUrl,
} from '@domains/links/participant-url-parsing/sources/youtube/helpers';

import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

export const getYoutubeVideoMetadata = getYoutubeVideoMetadataFromOembed;

interface GetYoutubeVideoRequestMetadataParams {
  videoId: string;
  signal?: AbortSignal;
}

export const getYoutubeVideoRequestMetadataWithFallback = async (
  params: GetYoutubeVideoRequestMetadataParams,
): Promise<ParticipantUrlVideoRequestMetadata> => {
  try {
    return await getYoutubeVideoRequestMetadataFromDataApi(params);
  } catch {
    try {
      return await getYoutubeVideoRequestMetadataFromWorker(params);
    } catch {
      const metadata = await getYoutubeVideoMetadataFromOembed(params);
      const canonicalUrl = buildYoutubeVideoUrl(params.videoId);

      return {
        source: 'youtube',
        provider: metadata.provider,
        canonicalUrl,
        player: {
          kind: 'iframe',
          embedUrl: buildYoutubeEmbedUrl(params.videoId),
          parentHost: null,
        },
        title: metadata.title,
        channelName: null,
        thumbnailUrl: buildYoutubeThumbnailUrl(params.videoId),
        durationSeconds: null,
        viewCount: null,
        likeCount: null,
        publishedAt: null,
        createdAt: null,
        sourceReference: {
          videoId: params.videoId,
        },
      };
    }
  }
};
