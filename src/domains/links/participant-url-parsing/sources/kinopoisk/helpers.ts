// Kinopoisk-specific URL and identifier helpers.
export type KinopoiskTitleType = 'film' | 'series';

interface KinopoiskTitleInfo {
  kinopoiskMovieId: string;
  kinopoiskTitleType: KinopoiskTitleType;
}

const KINOPOISK_TITLE_URL_REGEXP = /(?:https?:\/\/)?(?:(?:www|m)\.)?kinopoisk\.ru\/(film|series)\/(\d+)(?:[/?#]|$)/i;
const KINOPOISK_TITLE_IDENTIFIER_REGEXP = /\bkinopoisk\.ru\/(film|series)\/(\d+)\b/i;

export const buildKinopoiskMovieUrl = (
  kinopoiskMovieId: string,
  kinopoiskTitleType: KinopoiskTitleType = 'film',
): string => {
  return `https://www.kinopoisk.ru/${kinopoiskTitleType}/${kinopoiskMovieId}/`;
};

export const checkIsKinopoiskMovieUrl = (value: string): boolean => KINOPOISK_TITLE_URL_REGEXP.test(value);

export const extractKinopoiskTitleInfo = (value: string | null | undefined): KinopoiskTitleInfo | null => {
  if (!value) {
    return null;
  }

  const kinopoiskMovieUrlMatch = value.match(KINOPOISK_TITLE_URL_REGEXP);
  if (kinopoiskMovieUrlMatch?.[1] && kinopoiskMovieUrlMatch?.[2]) {
    return {
      kinopoiskTitleType: kinopoiskMovieUrlMatch[1].toLowerCase() as KinopoiskTitleType,
      kinopoiskMovieId: kinopoiskMovieUrlMatch[2],
    };
  }

  const kinopoiskMovieIdentifierMatch = value.match(KINOPOISK_TITLE_IDENTIFIER_REGEXP);
  if (kinopoiskMovieIdentifierMatch?.[1] && kinopoiskMovieIdentifierMatch?.[2]) {
    return {
      kinopoiskTitleType: kinopoiskMovieIdentifierMatch[1].toLowerCase() as KinopoiskTitleType,
      kinopoiskMovieId: kinopoiskMovieIdentifierMatch[2],
    };
  }

  return null;
};

export const extractKinopoiskMovieId = (value: string | null | undefined): string | null => {
  return extractKinopoiskTitleInfo(value)?.kinopoiskMovieId ?? null;
};
