// Shared Wikidata SPARQL provider.
import axios from 'axios';

const WIKIDATA_ENDPOINT_URL = 'https://query.wikidata.org/sparql';

interface WikidataSparqlResponse {
  results?: {
    bindings?: Record<string, { value: string }>[];
  };
}

export interface WikidataQueryParams {
  query: string;
  signal?: AbortSignal;
}

export type WikidataBinding = Record<string, { value: string }>;

export const queryWikidata = async (params: WikidataQueryParams): Promise<WikidataBinding | null> => {
  const { data: responseData } = await axios.get<WikidataSparqlResponse>(WIKIDATA_ENDPOINT_URL, {
    params: {
      query: params.query,
      format: 'json',
    },
    headers: {
      Accept: 'application/sparql-results+json',
    },
    signal: params.signal,
  });
  return responseData.results?.bindings?.[0] ?? null;
};
