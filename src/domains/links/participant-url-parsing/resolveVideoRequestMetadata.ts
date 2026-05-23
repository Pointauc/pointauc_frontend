import * as linkify from 'linkifyjs';

import { sourceByDomainMap } from '@domains/links/participant-url-parsing/shared/sourceRegistry';
import { extractDomainFromUrl, normalizeDomain } from '@domains/links/participant-url-parsing/shared/url';

import type {
  GetVideoRequestMetadataParams,
  ParticipantUrlSource,
  ParticipantUrlVideoRequestMetadata,
} from '@domains/links/participant-url-parsing/types';

interface ResolveVideoRequestMetadataParams extends Omit<GetVideoRequestMetadataParams, 'link'> {
  message: string;
}

const MARKDOWN_LINK_REGEXP = /\[([^\]]+)\]\(([^)\s]+)\)/g;

const normalizeLinkHref = (value: string): string | null => {
  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }
};

const checkIsInsideMarkdownLink = (startIndex: number, markdownRanges: { startIndex: number; endIndex: number }[]): boolean => {
  return markdownRanges.some((range) => startIndex >= range.startIndex && startIndex < range.endIndex);
};

const getMarkdownLinkRanges = (value: string): { startIndex: number; endIndex: number }[] => {
  return Array.from(value.matchAll(MARKDOWN_LINK_REGEXP))
    .filter((match) => match.index != null)
    .map((match) => ({
      startIndex: match.index ?? 0,
      endIndex: (match.index ?? 0) + match[0].length,
    }));
};

const resolveSourceFromLink = (link: string): ParticipantUrlSource | null => {
  const domain = extractDomainFromUrl(link);
  if (!domain) {
    return null;
  }

  const source = sourceByDomainMap.get(normalizeDomain(domain));
  if (!source || !source.checkIsValidLink(link)) {
    return null;
  }

  return source;
};

export const resolveVideoRequestMetadata = async (
  params: ResolveVideoRequestMetadataParams,
): Promise<ParticipantUrlVideoRequestMetadata | null> => {
  const markdownRanges = getMarkdownLinkRanges(params.message);

  for (const foundLink of linkify.find(params.message, 'url')) {
    if (foundLink.start == null || checkIsInsideMarkdownLink(foundLink.start, markdownRanges)) {
      continue;
    }

    const link = normalizeLinkHref(foundLink.href ?? foundLink.value);
    if (!link) {
      continue;
    }

    const source = resolveSourceFromLink(link);
    if (!source) {
      continue;
    }

    if (!source.getVideoRequestMetadata) {
      return null;
    }

    return source.getVideoRequestMetadata({
      link,
      signal: params.signal,
      parentHost: params.parentHost,
    });
  }

  return null;
};
