// IMDb source adapter: validates IMDb title links and converts them to markdown labels.
import { getImdbMovieMetadataWithFallback } from '@domains/links/participant-url-parsing/sources/imdb/providers';
import { buildImdbTitleUrl, checkIsImdbTitleUrl, extractImdbTitleId } from '@domains/links/participant-url-parsing/sources/imdb/helpers';

import type { ParseParticipantUrlParams, ParsedParticipantUrlResult, ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

const getMovieLabel = (title: string, year: number | null): string => {
  if (year) {
    return `${title} (${year})`;
  }

  return title;
};

export const imdbParticipantUrlSource: ParticipantUrlSource = {
  sourceName: 'IMDb',
  domains: ['imdb.com', 'www.imdb.com', 'm.imdb.com'],
  checkIsValidLink: (link: string): boolean => {
    return checkIsImdbTitleUrl(link) && extractImdbTitleId(link) != null;
  },
  parseLink: async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
    const imdbTitleId = extractImdbTitleId(params.link);
    if (!imdbTitleId) {
      return null;
    }

    const imdbUrl = buildImdbTitleUrl(imdbTitleId);
    const metadata = await getImdbMovieMetadataWithFallback({
      imdbTitleId,
      imdbUrl,
      signal: params.signal,
    });

    if (!metadata) {
      return null;
    }

    const label = getMovieLabel(metadata.title, metadata.year);
    return {
      markdownLink: `[${label}](${imdbUrl})`,
      metadata,
    };
  },
};
