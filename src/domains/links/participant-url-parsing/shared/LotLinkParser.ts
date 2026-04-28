// Runtime parser entrypoint for a single lot name.
import {
  parseLotLink,
  replaceFirstParsedLotLinkWithMarkdown,
  type ParsedLotLink,
} from '@domains/links/lib/lotNameLink';
import { sourceByDomainMap } from '@domains/links/participant-url-parsing/shared/sourceRegistry';
import { extractDomainFromUrl, normalizeDomain } from '@domains/links/participant-url-parsing/shared/url';

import type { ParsedParticipantUrlResult, ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

/**
 * Resolves the first lot link to a concrete source and replaces it with markdown when parsable.
 */
export class LotLinkParser {
  private readonly lotName: string;
  private readonly parsedLotLink: ParsedLotLink | null;
  private readonly source: ParticipantUrlSource | null;
  readonly hasValidSourceLink: boolean;
  readonly sourceName: string | null;
  readonly detectedLinkUrl: string | null;

  constructor(lotName: string | null | undefined) {
    this.lotName = lotName ?? '';
    this.parsedLotLink = parseLotLink(this.lotName);

    if (!this.parsedLotLink || this.parsedLotLink.markdownLink) {
      this.source = null;
      this.hasValidSourceLink = false;
      this.sourceName = null;
      this.detectedLinkUrl = null;
      return;
    }

    const domain = extractDomainFromUrl(this.parsedLotLink.href);
    if (!domain) {
      this.source = null;
      this.hasValidSourceLink = false;
      this.sourceName = null;
      this.detectedLinkUrl = null;
      return;
    }

    const matchedSource = sourceByDomainMap.get(normalizeDomain(domain)) ?? null;
    if (!matchedSource || !matchedSource.checkIsValidLink(this.parsedLotLink.href)) {
      this.source = null;
      this.hasValidSourceLink = false;
      this.sourceName = null;
      this.detectedLinkUrl = null;
      return;
    }

    this.source = matchedSource;
    this.hasValidSourceLink = true;
    this.sourceName = matchedSource.sourceName;
    this.detectedLinkUrl = this.parsedLotLink.href;
  }

  async replaceLinkWithMarkdown(signal?: AbortSignal): Promise<{ lotName: string; parsed: ParsedParticipantUrlResult } | null> {
    if (!this.hasValidSourceLink || !this.source || !this.parsedLotLink) {
      return null;
    }

    const parsed = await this.source.parseLink({
      link: this.parsedLotLink.href,
      signal,
    });

    if (!parsed) {
      return null;
    }

    return {
      lotName: replaceFirstParsedLotLinkWithMarkdown(this.lotName, this.parsedLotLink, parsed.markdownLink),
      parsed,
    };
  }
}
