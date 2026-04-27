import type { ParsedLotLink } from '@domains/links/lib/lotNameLink';

const IMDB_TITLE_IDENTIFIER_REGEXP = /(tt\d{4,})/i;
const IMDB_TITLE_URL_REGEXP = /(?:https?:\/\/)?(?:www\.|m\.)?imdb\.com\/title\/(tt\d{4,})/i;
const WIKIDATA_ENDPOINT_URL = 'https://query.wikidata.org/sparql';
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

export type MovieMetadataSource = 'tmdb' | 'wikidata' | 'imdb-scrape';

export interface RetrievedMovieMetadata {
  imdbTitleId: string;
  title: string;
  year: number | null;
  runtimeMinutes: number | null;
  rating: number | null;
  source: MovieMetadataSource;
  sourceUrl: string;
}

export interface GetMovieMetadataParams {
  imdbTitleId?: string | null;
  imdbUrl?: string | null;
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
}

export interface GetTmdbMovieMetadataParams extends GetMovieMetadataParams {
  apiKey: string;
  language?: string;
}

interface TmdbFindResponse {
  movie_results?: {
    id: number;
    title?: string;
    original_title?: string;
    release_date?: string;
    vote_average?: number;
  }[];
}

interface TmdbMovieDetailsResponse {
  title?: string;
  original_title?: string;
  release_date?: string;
  runtime?: number | null;
  vote_average?: number;
}

interface WikidataSparqlResponse {
  results?: {
    bindings?: {
      itemLabel?: { value: string };
      releaseDate?: { value: string };
      releaseYear?: { value: string };
      runtimeMinutes?: { value: string };
    }[];
  };
}

interface ImdbJsonLdMovieData {
  '@type'?: string | string[];
  name?: string;
  datePublished?: string;
  duration?: string;
  aggregateRating?: {
    ratingValue?: number | string;
  };
}

const defaultFetch = (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> => fetch(...args);

const getFetch = (fetchFn?: typeof fetch): typeof fetch => fetchFn ?? defaultFetch;

const buildImdbTitleUrl = (imdbTitleId: string): string => `https://www.imdb.com/title/${imdbTitleId}/`;

const checkIsImdbTitleUrl = (value: string): boolean => IMDB_TITLE_URL_REGEXP.test(value);

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

export const extractImdbTitleIdFromLotLink = (lotLink: ParsedLotLink | null): string | null => {
  if (!lotLink) {
    return null;
  }

  return extractImdbTitleId(lotLink.href) ?? extractImdbTitleId(lotLink.url);
};

const resolveImdbTitleId = (params: GetMovieMetadataParams): string => {
  const imdbTitleId = extractImdbTitleId(params.imdbTitleId) ?? extractImdbTitleId(params.imdbUrl);

  if (!imdbTitleId) {
    throw new Error('Failed to resolve an IMDb title identifier from the provided input.');
  }

  return imdbTitleId;
};

const getYearFromDate = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const match = value.match(/^[+-]?(\d{4})/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

const getNumericValue = (value: number | string | null | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const parsedNumber = Number(value);
  return Number.isFinite(parsedNumber) ? parsedNumber : null;
};

const getRuntimeMinutesFromIsoDuration = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const durationMatch = value.match(/^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!durationMatch) {
    return null;
  }

  const hours = Number(durationMatch[1] ?? 0);
  const minutes = Number(durationMatch[2] ?? 0);
  const totalMinutes = hours * 60 + minutes;

  return totalMinutes > 0 ? totalMinutes : null;
};

const checkResponseStatus = async (response: Response, errorPrefix: string): Promise<void> => {
  if (response.ok) {
    return;
  }

  const errorText = await response.text().catch(() => '');
  const errorSuffix = errorText ? ` ${errorText}` : '';
  throw new Error(`${errorPrefix} Request failed with status ${response.status}.${errorSuffix}`.trim());
};

const parseJsonLdBlocksFromHtml = (html: string): ImdbJsonLdMovieData[] => {
  const scriptMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const parsedBlocks: ImdbJsonLdMovieData[] = [];

  for (const scriptMatch of scriptMatches) {
    const jsonText = scriptMatch[1]?.trim();
    if (!jsonText) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(jsonText);
      if (Array.isArray(parsedValue)) {
        parsedBlocks.push(...parsedValue);
        continue;
      }

      parsedBlocks.push(parsedValue);
    } catch {
      continue;
    }
  }

  return parsedBlocks;
};

const checkIsMovieJsonLd = (jsonLdBlock: ImdbJsonLdMovieData): boolean => {
  if (!jsonLdBlock['@type']) {
    return false;
  }

  if (Array.isArray(jsonLdBlock['@type'])) {
    return jsonLdBlock['@type'].some((value) => value === 'Movie');
  }

  return jsonLdBlock['@type'] === 'Movie';
};

const getMovieJsonLd = (html: string): ImdbJsonLdMovieData | null => {
  const parsedJsonLdBlocks = parseJsonLdBlocksFromHtml(html);
  return parsedJsonLdBlocks.find(checkIsMovieJsonLd) ?? parsedJsonLdBlocks[0] ?? null;
};

/**
 * Retrieves movie metadata from TMDb by resolving the pasted IMDb title identifier first,
 * then expanding the matched TMDb movie details for runtime and rating.
 */
export const getMovieMetadataFromTmdb = async (
  params: GetTmdbMovieMetadataParams,
): Promise<RetrievedMovieMetadata> => {
  const imdbTitleId = resolveImdbTitleId(params);
  const fetchFn = getFetch(params.fetchFn);
  const language = params.language ?? 'en-US';

  const findUrl = new URL(`${TMDB_API_BASE_URL}/find/${imdbTitleId}`);
  findUrl.searchParams.set('api_key', params.apiKey);
  findUrl.searchParams.set('external_source', 'imdb_id');
  findUrl.searchParams.set('language', language);

  const findResponse = await fetchFn(findUrl, {
    headers: {
      Accept: 'application/json',
    },
    signal: params.signal,
  });

  await checkResponseStatus(findResponse, 'TMDb find request failed.');

  const findData = (await findResponse.json()) as TmdbFindResponse;
  const matchedMovie = findData.movie_results?.[0];

  if (!matchedMovie?.id) {
    throw new Error(`TMDb did not return a movie match for IMDb title ${imdbTitleId}.`);
  }

  const detailsUrl = new URL(`${TMDB_API_BASE_URL}/movie/${matchedMovie.id}`);
  detailsUrl.searchParams.set('api_key', params.apiKey);
  detailsUrl.searchParams.set('language', language);

  const detailsResponse = await fetchFn(detailsUrl, {
    headers: {
      Accept: 'application/json',
    },
    signal: params.signal,
  });

  await checkResponseStatus(detailsResponse, 'TMDb movie details request failed.');

  const detailsData = (await detailsResponse.json()) as TmdbMovieDetailsResponse;
  const title = detailsData.title ?? detailsData.original_title ?? matchedMovie.title ?? matchedMovie.original_title;

  if (!title) {
    throw new Error(`TMDb did not provide a title for IMDb title ${imdbTitleId}.`);
  }

  return {
    imdbTitleId,
    title,
    year: getYearFromDate(detailsData.release_date ?? matchedMovie.release_date),
    runtimeMinutes: getNumericValue(detailsData.runtime),
    rating: getNumericValue(detailsData.vote_average ?? matchedMovie.vote_average),
    source: 'tmdb',
    sourceUrl: detailsUrl.toString(),
  };
};

/**
 * Retrieves movie metadata from Wikidata through the public SPARQL endpoint using the IMDb ID property.
 */
export const getMovieMetadataFromWikidata = async (
  params: GetMovieMetadataParams,
): Promise<RetrievedMovieMetadata> => {
  const imdbTitleId = resolveImdbTitleId(params);
  const fetchFn = getFetch(params.fetchFn);
  const query = `
SELECT ?itemLabel ?releaseDate ?releaseYear ?runtimeMinutes WHERE {
  ?item wdt:P345 "${imdbTitleId}".
  OPTIONAL {
    { ?item wdt:P577 ?releaseDate. }
    UNION
    { ?item wdt:P571 ?releaseDate. }
    BIND(STR(YEAR(?releaseDate)) AS ?releaseYear)
  }
  OPTIONAL {
    ?item p:P2047 ?runtimeStatement.
    ?runtimeStatement ps:P2047 ?runtimeRawValue.
    ?runtimeStatement psv:P2047 ?runtimeValueNode.
    ?runtimeValueNode wikibase:quantityUnit wd:Q7727.
    BIND(STR(?runtimeRawValue) AS ?runtimeMinutes)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?releaseDate
LIMIT 1`.trim();

  const wikidataUrl = new URL(WIKIDATA_ENDPOINT_URL);
  wikidataUrl.searchParams.set('query', query);
  wikidataUrl.searchParams.set('format', 'json');

  const response = await fetchFn(wikidataUrl, {
    headers: {
      Accept: 'application/sparql-results+json',
    },
    signal: params.signal,
  });

  await checkResponseStatus(response, 'Wikidata query failed.');

  const responseData = (await response.json()) as WikidataSparqlResponse;
  const matchedMovie = responseData.results?.bindings?.[0];
  const title = matchedMovie?.itemLabel?.value?.trim();

  if (!title) {
    throw new Error(`Wikidata did not return a movie match for IMDb title ${imdbTitleId}.`);
  }

  return {
    imdbTitleId,
    title,
    year: getNumericValue(matchedMovie.releaseYear?.value) ?? getYearFromDate(matchedMovie.releaseDate?.value),
    runtimeMinutes: getNumericValue(matchedMovie.runtimeMinutes?.value),
    rating: null,
    source: 'wikidata',
    sourceUrl: wikidataUrl.toString(),
  };
};

/**
 * Scrapes the public IMDb title page and reads JSON-LD metadata embedded in the HTML.
 * This path is intentionally isolated because browser CORS and anti-bot protections may block it.
 */
export const getMovieMetadataFromImdbPage = async (
  params: GetMovieMetadataParams,
): Promise<RetrievedMovieMetadata> => {
  const imdbTitleId = resolveImdbTitleId(params);
  const fetchFn = getFetch(params.fetchFn);
  const imdbUrl = checkIsImdbTitleUrl(params.imdbUrl ?? '') ? params.imdbUrl ?? buildImdbTitleUrl(imdbTitleId) : buildImdbTitleUrl(imdbTitleId);

  const response = await fetchFn(imdbUrl, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: params.signal,
  });

  await checkResponseStatus(response, 'IMDb page request failed.');

  const html = await response.text();
  const movieJsonLd = getMovieJsonLd(html);

  if (!movieJsonLd?.name) {
    throw new Error(`IMDb page scraping did not find movie metadata for ${imdbTitleId}.`);
  }

  return {
    imdbTitleId,
    title: movieJsonLd.name,
    year: getYearFromDate(movieJsonLd.datePublished),
    runtimeMinutes: getRuntimeMinutesFromIsoDuration(movieJsonLd.duration),
    rating: getNumericValue(movieJsonLd.aggregateRating?.ratingValue),
    source: 'imdb-scrape',
    sourceUrl: imdbUrl,
  };
};
