import * as linkify from 'linkifyjs';

const MARKDOWN_LINK_REGEXP = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const URL_CANDIDATE_REGEXP = /https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}/i;

export interface ParsedLotMarkdownLink {
  label: string;
  rawMarkdown: string;
  rawUrl: string;
  href: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedLotLink {
  href: string;
  url: string;
  markdownLink: ParsedLotMarkdownLink | null;
}

const normalizeUrl = (value: string): string | null => {
  if (!value) {
    return null;
  }

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

export const parseMarkdownLotLink = (value: string | null | undefined): ParsedLotMarkdownLink | null => {
  if (!value || !value.includes('[') || !value.includes('](') || !value.includes(')')) {
    return null;
  }

  for (const markdownMatch of value.matchAll(MARKDOWN_LINK_REGEXP)) {
    const [, label, rawUrl] = markdownMatch;
    const startIndex = markdownMatch.index;
    const href = normalizeUrl(rawUrl);

    if (startIndex == null || !href) {
      continue;
    }

    return {
      label,
      rawMarkdown: markdownMatch[0],
      rawUrl,
      href,
      startIndex,
      endIndex: startIndex + markdownMatch[0].length,
    };
  }

  return null;
};

export const parseLotLink = (value: string | null | undefined): ParsedLotLink | null => {
  if (!value) {
    return null;
  }

  const markdownLink = parseMarkdownLotLink(value);
  if (markdownLink) {
    return {
      href: markdownLink.href,
      url: markdownLink.rawUrl,
      markdownLink,
    };
  }

  const foundLinks = linkify.find(value, 'url');
  const firstValidLink = foundLinks.find((item) => normalizeUrl(item.href ?? item.value));
  if (!firstValidLink) {
    return null;
  }

  return {
    href: firstValidLink.href ?? firstValidLink.value,
    url: firstValidLink.value,
    markdownLink: null,
  };
};
