// Kinopoisk source adapter: validates Kinopoisk movie links and converts them to markdown labels.
import { getKinopoiskMovieMetadataWithFallback } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers';
import {
  buildKinopoiskMovieUrl,
  checkIsKinopoiskMovieUrl,
  extractKinopoiskMovieId,
} from '@domains/links/participant-url-parsing/sources/kinopoisk/helpers';

import type {
  ParseParticipantUrlParams,
  ParsedParticipantUrlResult,
  ParticipantUrlSource,
} from '@domains/links/participant-url-parsing/types';

const getMovieLabel = (title: string, year: number | null): string => {
  if (year) {
    return `${title} (${year})`;
  }

  return title;
};

export const kinopoiskParticipantUrlSource: ParticipantUrlSource = {
  sourceName: 'Kinopoisk',
  domains: ['kinopoisk.ru', 'www.kinopoisk.ru', 'm.kinopoisk.ru'],
  checkIsValidLink: (link: string): boolean => {
    return checkIsKinopoiskMovieUrl(link) && extractKinopoiskMovieId(link) != null;
  },
  parseLink: async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
    const kinopoiskMovieId = extractKinopoiskMovieId(params.link);
    if (!kinopoiskMovieId) {
      return null;
    }

    const kinopoiskUrl = buildKinopoiskMovieUrl(kinopoiskMovieId);
    const metadata = await getKinopoiskMovieMetadataWithFallback({
      kinopoiskMovieId,
      kinopoiskUrl,
      signal: params.signal,
    });

    if (!metadata) {
      return null;
    }

    const label = getMovieLabel(metadata.title, metadata.year);
    return {
      markdownLink: `[${label}](${kinopoiskUrl})`,
      metadata,
    };
  },
};
