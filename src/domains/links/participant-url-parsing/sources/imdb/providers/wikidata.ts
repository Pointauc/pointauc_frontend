// IMDb metadata resolver via Wikidata SPARQL.
import {
  queryWikidata,
  type WikidataBinding,
} from '@domains/links/participant-url-parsing/shared/providers/wikidata';
import { getNumericValue, getYearFromDate } from '@domains/links/participant-url-parsing/shared/valueParsers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromWikidataParams {
  imdbTitleId: string;
  signal?: AbortSignal;
}

const getString = (binding: WikidataBinding | null, key: string): string | null => binding?.[key]?.value?.trim() ?? null;

export const getMovieMetadataFromWikidata = async (
  params: GetMovieMetadataFromWikidataParams,
): Promise<ParticipantUrlMovieMetadata> => {
  const query = `
SELECT ?itemLabel ?releaseDate ?releaseYear ?runtimeMinutes WHERE {
  ?item wdt:P345 "${params.imdbTitleId}".
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

  const matchedMovie = await queryWikidata({
    query,
    signal: params.signal,
  });

  const title = getString(matchedMovie, 'itemLabel');
  if (!title) {
    throw new Error(`Wikidata did not return a movie match for IMDb title ${params.imdbTitleId}.`);
  }

  const releaseYear = getNumericValue(getString(matchedMovie, 'releaseYear'));
  const releaseDateYear = getYearFromDate(getString(matchedMovie, 'releaseDate'));

  return {
    imdbTitleId: params.imdbTitleId,
    title,
    year: releaseYear ?? releaseDateYear,
    runtimeMinutes: getNumericValue(getString(matchedMovie, 'runtimeMinutes')),
    rating: null,
    source: 'imdb',
    provider: 'wikidata',
    sourceUrl: 'https://query.wikidata.org/sparql',
  };
};
