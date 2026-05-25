import * as linkify from 'linkifyjs';

const URL_CANDIDATE_REGEXP = /https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}/i;

export interface ParsedLotMarkdownLink {
  label: string;
  rawLabel: string;
  rawMarkdown: string;
  rawUrl: string;
  href: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedLotLink {
  href: string;
  url: string;
  startIndex: number;
  endIndex: number;
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

const unescapeMarkdownLabel = (value: string): string => {
  return value.replace(/\\([\\[\]])/g, '$1');
};

export const parseMarkdownLotLink = (value: string | null | undefined): ParsedLotMarkdownLink | null => {
  if (!value || !value.includes('[') || !value.includes('](') || !value.includes(')')) {
    return null;
  }

  let startIndex = -1;
  let labelEndIndex = -1;
  let isEscaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (startIndex === -1) {
      if (character === '[') {
        startIndex = index;
      }

      continue;
    }

    if (labelEndIndex === -1) {
      if (character === '\\') {
        isEscaped = !isEscaped;
        continue;
      }

      if (character === ']' && value[index + 1] === '(' && !isEscaped) {
        labelEndIndex = index;
        index += 1;
        isEscaped = false;
        continue;
      }

      isEscaped = false;
      continue;
    }

    if (/\s/.test(character)) {
      startIndex = -1;
      labelEndIndex = -1;
      isEscaped = false;
      continue;
    }

    if (character === '\\') {
      isEscaped = !isEscaped;
      continue;
    }

    if (character === ')' && !isEscaped) {
      const rawLabel = value.slice(startIndex + 1, labelEndIndex);
      const rawUrl = value.slice(labelEndIndex + 2, index);
      const href = normalizeUrl(rawUrl);

      if (!href) {
        startIndex = -1;
        labelEndIndex = -1;
        isEscaped = false;
        continue;
      }

      return {
        label: unescapeMarkdownLabel(rawLabel),
        rawLabel,
        rawMarkdown: value.slice(startIndex, index + 1),
        rawUrl,
        href,
        startIndex,
        endIndex: index + 1,
      };
    }

    isEscaped = false;
  }

  return null;
};

export const parseLotLink = (value: string | null | undefined): ParsedLotLink | null => {
  if (!value) {
    return null;
  }

  const markdownLink = parseMarkdownLotLink(value);
  const foundLinks = linkify.find(value, 'url');
  const firstValidLink = foundLinks.find((item) => normalizeUrl(item.href ?? item.value));
  const firstPlainLink =
    firstValidLink && firstValidLink.start != null && firstValidLink.end != null
      ? {
          href: firstValidLink.href ?? firstValidLink.value,
          url: firstValidLink.value,
          startIndex: firstValidLink.start,
          endIndex: firstValidLink.end,
          markdownLink: null,
        }
      : null;

  if (markdownLink && (!firstPlainLink || markdownLink.startIndex <= firstPlainLink.startIndex)) {
    return {
      href: markdownLink.href,
      url: markdownLink.rawUrl,
      startIndex: markdownLink.startIndex,
      endIndex: markdownLink.endIndex,
      markdownLink,
    };
  }

  if (!firstPlainLink) {
    return null;
  }

  return firstPlainLink;
};

export const checkHasMarkdownLotLink = (value: string | null | undefined): boolean =>
  parseMarkdownLotLink(value) != null;

export const getLotNameDisplayName = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }

  const markdownLink = parseMarkdownLotLink(value);
  if (!markdownLink) {
    return value;
  }

  return `${value.slice(0, markdownLink.startIndex)}${markdownLink.label}${value.slice(markdownLink.endIndex)}`;
};

export const replaceFirstParsedLotLinkWithMarkdown = (
  lotName: string,
  parsedLink: ParsedLotLink,
  markdownLink: string,
): string => {
  return `${lotName.slice(0, parsedLink.startIndex)}${markdownLink}${lotName.slice(parsedLink.endIndex)}`;
};
