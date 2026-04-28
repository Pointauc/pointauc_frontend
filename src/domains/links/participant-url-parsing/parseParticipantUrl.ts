// Direct parser entrypoint for a single URL (without lot-name context).
import { sourceByDomainMap } from '@domains/links/participant-url-parsing/shared/sourceRegistry';
import { extractDomainFromUrl, normalizeDomain } from '@domains/links/participant-url-parsing/shared/url';

import type { ParseParticipantUrlParams, ParsedParticipantUrlResult } from '@domains/links/participant-url-parsing/types';

export const parseParticipantUrl = async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
  if (!params.link) {
    return null;
  }

  const domain = extractDomainFromUrl(params.link);
  if (!domain) {
    return null;
  }

  const source = sourceByDomainMap.get(normalizeDomain(domain));
  if (!source || !source.checkIsValidLink(params.link)) {
    return null;
  }

  return (await source.parseLink(params)) ?? null;
};
