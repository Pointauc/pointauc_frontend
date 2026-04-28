// IMDb-specific URL and identifier helpers.
const IMDB_TITLE_IDENTIFIER_REGEXP = /(tt\d{4,})/i;
const IMDB_TITLE_URL_REGEXP = /(?:https?:\/\/)?(?:www\.|m\.)?imdb\.com\/title\/(tt\d{4,})/i;

export const buildImdbTitleUrl = (imdbTitleId: string): string => `https://www.imdb.com/title/${imdbTitleId}/`;

export const checkIsImdbTitleUrl = (value: string): boolean => IMDB_TITLE_URL_REGEXP.test(value);

export const extractImdbTitleId = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const imdbUrlMatch = value.match(IMDB_TITLE_URL_REGEXP);
  if (imdbUrlMatch?.[1]) {
    return imdbUrlMatch[1].toLowerCase();
  }

  const imdbTitleIdentifierMatch = value.match(IMDB_TITLE_IDENTIFIER_REGEXP);
  return imdbTitleIdentifierMatch?.[1]?.toLowerCase() ?? null;
};
