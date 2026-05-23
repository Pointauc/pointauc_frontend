import axios from 'axios';

import { YOUTUBE_API_KEYS } from '@constants/common.constants';
import {
  buildYoutubeEmbedUrl,
  buildYoutubeThumbnailUrl,
  buildYoutubeVideoUrl,
} from '@domains/links/participant-url-parsing/sources/youtube/helpers';
import { getNumericValue, getSecondsFromIsoDuration } from '@domains/links/participant-url-parsing/shared/valueParsers';

import type { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';

interface GetYoutubeVideoRequestMetadataFromDataApiParams {
  videoId: string;
  signal?: AbortSignal;
}

interface YoutubeDataApiThumbnail {
  url?: string;
  width?: number;
}

interface YoutubeDataApiVideo {
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: Record<string, YoutubeDataApiThumbnail | undefined>;
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
  };
  status?: {
    embeddable?: boolean;
  };
}

interface YoutubeDataApiResponse {
  items?: YoutubeDataApiVideo[];
}

const YOUTUBE_VIDEOS_ENDPOINT_URL = 'https://www.googleapis.com/youtube/v3/videos';

const getBestThumbnailUrl = (thumbnails: Record<string, YoutubeDataApiThumbnail | undefined> | undefined): string | null => {
  if (!thumbnails) {
    return null;
  }

  const sortedThumbnails = Object.values(thumbnails)
    .filter((thumbnail): thumbnail is YoutubeDataApiThumbnail => Boolean(thumbnail?.url))
    .sort((left, right) => (right.width ?? 0) - (left.width ?? 0));

  return sortedThumbnails[0]?.url ?? null;
};

export const getYoutubeVideoRequestMetadataFromDataApi = async (
  params: GetYoutubeVideoRequestMetadataFromDataApiParams,
): Promise<ParticipantUrlVideoRequestMetadata> => {
  for (const apiKey of YOUTUBE_API_KEYS) {
    if (!apiKey) {
      continue;
    }

    const { data } = await axios.get<YoutubeDataApiResponse>(YOUTUBE_VIDEOS_ENDPOINT_URL, {
      params: {
        id: params.videoId,
        part: 'snippet,contentDetails,statistics,status',
        key: apiKey,
      },
      headers: {
        Accept: 'application/json',
      },
      signal: params.signal,
    });

    const video = data.items?.[0];
    const title = video?.snippet?.title?.trim();
    if (!video || !title) {
      throw new Error(`YouTube Data API did not return video ${params.videoId}.`);
    }

    const canonicalUrl = buildYoutubeVideoUrl(params.videoId);
    return {
      source: 'youtube',
      provider: 'youtube-data-api',
      canonicalUrl,
      player: {
        kind: 'iframe',
        embedUrl: buildYoutubeEmbedUrl(params.videoId),
        parentHost: null,
      },
      title,
      channelName: video.snippet?.channelTitle?.trim() || null,
      thumbnailUrl: getBestThumbnailUrl(video.snippet?.thumbnails) ?? buildYoutubeThumbnailUrl(params.videoId),
      durationSeconds: getSecondsFromIsoDuration(video.contentDetails?.duration),
      viewCount: getNumericValue(video.statistics?.viewCount),
      likeCount: getNumericValue(video.statistics?.likeCount),
      publishedAt: video.snippet?.publishedAt ?? null,
      createdAt: null,
      sourceReference: {
        videoId: params.videoId,
        isEmbeddable: video.status?.embeddable ?? null,
      },
    };
  }

  throw new Error('No YouTube Data API key is configured.');
};
