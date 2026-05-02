// IMDb metadata resolver via Wikidata SPARQL.
import i18n from '@assets/i18n';
import { queryWikidata, type WikidataBinding } from '@domains/links/participant-url-parsing/shared/providers/wikidata';
import { getNumericValue, getYearFromDate } from '@domains/links/participant-url-parsing/shared/valueParsers';

import type { ParticipantUrlMovieMetadata } from '@domains/links/participant-url-parsing/types';

interface GetMovieMetadataFromWikidataParams {
  imdbTitleId: string;
  signal?: AbortSignal;
}

const getString = (binding: WikidataBinding | null, key: string): string | null =>
  binding?.[key]?.value?.trim() ?? null;

interface GetMovieMetadataFromWikidataParamsExtended extends GetMovieMetadataFromWikidataParams {
  language?: string;
}

export const _getMovieMetadataFromWikidata = async (
  params: GetMovieMetadataFromWikidataParamsExtended,
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
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${params.language ?? 'en'}". }
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
    kind: 'movie',
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

export const getMovieMetadataFromWikidata = async (
  params: GetMovieMetadataFromWikidataParams,
): Promise<ParticipantUrlMovieMetadata> => {
  if (i18n.language === 'en') {
    return _getMovieMetadataFromWikidata({
      ...params,
      language: 'en',
    });
  } else {
    return _getMovieMetadataFromWikidata({
      ...params,
      language: i18n.language,
    }).catch(() => {
      return _getMovieMetadataFromWikidata({
        ...params,
        language: 'en',
      });
    });
  }
};
