// Builds a domain -> source map once at startup to speed up runtime lookup.
import { participantUrlSources } from '@domains/links/participant-url-parsing/sources';
import { normalizeDomain } from '@domains/links/participant-url-parsing/shared/url';

import type { ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

const buildSourceMapByDomain = (): Map<string, ParticipantUrlSource> => {
  const sourceMap = new Map<string, ParticipantUrlSource>();

  for (const source of participantUrlSources) {
    for (const domain of source.domains) {
      sourceMap.set(normalizeDomain(domain), source);
    }
  }

  return sourceMap;
};

export const sourceByDomainMap = buildSourceMapByDomain();
