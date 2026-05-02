import axios from 'axios';

import { buildYoutubeVideoUrl } from '@domains/links/participant-url-parsing/sources/youtube/helpers';

import type { ParticipantUrlVideoMetadata } from '@domains/links/participant-url-parsing/types';

interface GetYoutubeVideoMetadataFromOembedParams {
  videoId: string;
  signal?: AbortSignal;
}

interface YoutubeOembedResponse {
  title?: string;
}

const YOUTUBE_OEMBED_ENDPOINT_URL = 'https://www.youtube.com/oembed';

export const getYoutubeVideoMetadataFromOembed = async (
  params: GetYoutubeVideoMetadataFromOembedParams,
): Promise<ParticipantUrlVideoMetadata> => {
  const canonicalVideoUrl = buildYoutubeVideoUrl(params.videoId);
  const { data } = await axios.get<YoutubeOembedResponse>(YOUTUBE_OEMBED_ENDPOINT_URL, {
    params: {
      url: canonicalVideoUrl,
      format: 'json',
    },
    headers: {
      Accept: 'application/json',
    },
    signal: params.signal,
  });

  const title = data.title?.trim();
  if (!title) {
    throw new Error(`YouTube oEmbed did not return title for video ${params.videoId}.`);
  }

  return {
    kind: 'video',
    videoId: params.videoId,
    title,
    source: 'youtube',
    provider: 'youtube-oembed',
    sourceUrl: canonicalVideoUrl,
  };
};
