// Kinopoisk source adapter: validates Kinopoisk movie links and converts them to markdown labels.
import { getKinopoiskMovieMetadataWithFallback } from '@domains/links/participant-url-parsing/sources/kinopoisk/providers';
import {
  buildKinopoiskMovieUrl,
  checkIsKinopoiskMovieUrl,
  extractKinopoiskTitleInfo,
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
    return checkIsKinopoiskMovieUrl(link) && extractKinopoiskTitleInfo(link) != null;
  },
  parseLink: async (params: ParseParticipantUrlParams): Promise<ParsedParticipantUrlResult | null> => {
    const kinopoiskTitleInfo = extractKinopoiskTitleInfo(params.link);
    if (!kinopoiskTitleInfo) {
      return null;
    }

    const metadata = await getKinopoiskMovieMetadataWithFallback({
      kinopoiskMovieId: kinopoiskTitleInfo.kinopoiskMovieId,
      kinopoiskUrl: params.link,
      signal: params.signal,
    });

    if (!metadata) {
      return null;
    }

    const label = getMovieLabel(metadata.title, metadata.year);
    return {
      markdownLink: `[${label}](${params.link})`,
      metadata,
    };
  },
};
