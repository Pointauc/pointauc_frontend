import {
  buildTwitchClipUrl,
  buildTwitchVideoUrl,
  checkIsTwitchVideoRequestUrl,
  extractTwitchVideoRequestReference,
  TWITCH_SUPPORTED_DOMAINS,
} from '@domains/links/participant-url-parsing/sources/twitch/helpers';
import { getTwitchVideoRequestMetadataWithFallback } from '@domains/links/participant-url-parsing/sources/twitch/providers';

import type {
  ParseParticipantUrlParams,
  ParsedParticipantUrlResult,
  ParticipantUrlSource,
} from '@domains/links/participant-url-parsing/types';

const escapeMarkdownLinkLabel = (value: string): string => {
  return value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
};

export const twitchParticipantUrlSource: ParticipantUrlSource = {
  sourceName: 'Twitch',
  domains: [...TWITCH_SUPPORTED_DOMAINS],
  checkIsValidLink: (link: string): boolean => {
    return checkIsTwitchVideoRequestUrl(link);
  },
  parseLink: async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
    const reference = extractTwitchVideoRequestReference(params.link);
    if (!reference) {
      return null;
    }

    const canonicalUrl =
      reference.kind === 'clip'
        ? buildTwitchClipUrl(reference.slug)
        : buildTwitchVideoUrl(reference.videoId, reference.startsAtSeconds);
    const fallbackTitle = reference.kind === 'clip' ? 'Twitch clip' : 'Twitch video';

    return {
      markdownLink: `[${escapeMarkdownLinkLabel(fallbackTitle)}](${canonicalUrl})`,
      metadata: {
        kind: 'video',
        videoId: reference.kind === 'clip' ? reference.slug : reference.videoId,
        title: fallbackTitle,
        source: 'twitch',
        provider: 'twitch-url-fallback',
        sourceUrl: canonicalUrl,
      },
    };
  },
  getVideoRequestMetadata: async (params) => {
    const reference = extractTwitchVideoRequestReference(params.link);
    if (!reference) {
      return null;
    }

    return getTwitchVideoRequestMetadataWithFallback({
      reference,
      parentHost: params.parentHost,
      signal: params.signal,
    });
  },
};
