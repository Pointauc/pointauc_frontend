import { getYoutubeVideoMetadata } from '@domains/links/participant-url-parsing/sources/youtube/providers';
import {
  buildYoutubeVideoUrl,
  checkIsYoutubeVideoUrl,
  extractYoutubeVideoId,
  YOUTUBE_SUPPORTED_DOMAINS,
} from '@domains/links/participant-url-parsing/sources/youtube/helpers';

import type {
  ParseParticipantUrlParams,
  ParsedParticipantUrlResult,
  ParticipantUrlSource,
} from '@domains/links/participant-url-parsing/types';

const escapeMarkdownLinkLabel = (value: string): string => {
  return value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
};

export const youtubeParticipantUrlSource: ParticipantUrlSource = {
  sourceName: 'YouTube',
  domains: [...YOUTUBE_SUPPORTED_DOMAINS],
  checkIsValidLink: (link: string): boolean => {
    return checkIsYoutubeVideoUrl(link);
  },
  parseLink: async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
    const videoId = extractYoutubeVideoId(params.link);
    if (!videoId) {
      return null;
    }

    const canonicalVideoUrl = buildYoutubeVideoUrl(videoId);
    const metadata = await getYoutubeVideoMetadata({
      videoId,
      signal: params.signal,
    });

    return {
      markdownLink: `[${escapeMarkdownLinkLabel(metadata.title)}](${canonicalVideoUrl})`,
      metadata,
    };
  },
};
