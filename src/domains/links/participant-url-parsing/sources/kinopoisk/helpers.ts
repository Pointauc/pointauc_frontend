// Kinopoisk-specific URL and identifier helpers.
const KINOPOISK_MOVIE_URL_REGEXP = /(?:https?:\/\/)?(?:(?:www|m)\.)?kinopoisk\.ru\/film\/(\d+)(?:[/?#]|$)/i;
const KINOPOISK_MOVIE_IDENTIFIER_REGEXP = /\bkinopoisk\.ru\/film\/(\d+)\b/i;

export const buildKinopoiskMovieUrl = (kinopoiskMovieId: string): string => {
  return `https://www.kinopoisk.ru/film/${kinopoiskMovieId}/`;
};

export const checkIsKinopoiskMovieUrl = (value: string): boolean => KINOPOISK_MOVIE_URL_REGEXP.test(value);

export const extractKinopoiskMovieId = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const kinopoiskMovieUrlMatch = value.match(KINOPOISK_MOVIE_URL_REGEXP);
  if (kinopoiskMovieUrlMatch?.[1]) {
    return kinopoiskMovieUrlMatch[1];
  }

  const kinopoiskMovieIdentifierMatch = value.match(KINOPOISK_MOVIE_IDENTIFIER_REGEXP);
  return kinopoiskMovieIdentifierMatch?.[1] ?? null;
};
