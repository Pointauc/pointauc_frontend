// Kinopoisk metadata resolver via Wikidata SPARQL.
import { queryWikidata, type WikidataBinding } from '@domains/links/participant-url-parsing/shared/providers/wikidata';
import { getNumericValue, getYearFromDate } from '@domains/links/participant-url-parsing/shared/valueParsers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromWikidataParams {
  kinopoiskMovieId: string;
  signal?: AbortSignal;
}

const getString = (binding: WikidataBinding | null, key: string): string | null =>
  binding?.[key]?.value?.trim() ?? null;

export const getMovieMetadataFromWikidata = async (
  params: GetMovieMetadataFromWikidataParams,
): Promise<ParticipantUrlMovieMetadata> => {
  const query = `
SELECT ?itemLabel ?releaseDate ?releaseYear ?runtimeMinutes ?imdbTitleId WHERE {
  ?item wdt:P2603 "${params.kinopoiskMovieId}".
  OPTIONAL { ?item wdt:P345 ?imdbTitleId. }
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
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru". }
}
ORDER BY ?releaseDate
LIMIT 1`.trim();

  const matchedMovie = await queryWikidata({
    query,
    signal: params.signal,
  });

  const title = getString(matchedMovie, 'itemLabel');
  if (!title) {
    throw new Error(`Wikidata did not return a movie match for Kinopoisk movie ${params.kinopoiskMovieId}.`);
  }

  const releaseYear = getNumericValue(getString(matchedMovie, 'releaseYear'));
  const releaseDateYear = getYearFromDate(getString(matchedMovie, 'releaseDate'));

  return {
    kind: 'movie',
    imdbTitleId: getString(matchedMovie, 'imdbTitleId') ?? params.kinopoiskMovieId,
    title,
    year: releaseYear ?? releaseDateYear,
    runtimeMinutes: getNumericValue(getString(matchedMovie, 'runtimeMinutes')),
    rating: null,
    source: 'kinopoisk',
    provider: 'wikidata',
    sourceUrl: 'https://query.wikidata.org/sparql',
  };
};

export const getWikidataEntityIdByKinopoiskMovieId = async (
  params: GetMovieMetadataFromWikidataParams,
): Promise<{ wikidataEntityId: string; imdbTitleId: string | null }> => {
  const query = `
SELECT ?item ?imdbTitleId WHERE {
  ?item wdt:P2603 "${params.kinopoiskMovieId}".
  OPTIONAL { ?item wdt:P345 ?imdbTitleId. }
}
LIMIT 1`.trim();

  const matchedMovie = await queryWikidata({
    query,
    signal: params.signal,
  });

  const itemUrl = getString(matchedMovie, 'item');
  const wikidataEntityId = itemUrl?.match(/\/(Q\d+)$/)?.[1] ?? null;
  if (!wikidataEntityId) {
    throw new Error(`Wikidata did not return a Wikidata entity ID for Kinopoisk movie ${params.kinopoiskMovieId}.`);
  }

  return {
    wikidataEntityId,
    imdbTitleId: getString(matchedMovie, 'imdbTitleId'),
  };
};
