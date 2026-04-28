// Shared contracts for participant URL parsing sources and parsing results.
export type ParticipantUrlParsingSource = 'imdb';

export type ParticipantUrlParsingProvider = 'wikidata' | 'tmdb' | 'imdb-scrape';

export interface ParticipantUrlMovieMetadata {
  imdbTitleId: string;
  title: string;
  year: number | null;
  runtimeMinutes: number | null;
  rating: number | null;
  source: ParticipantUrlParsingSource;
  provider: ParticipantUrlParsingProvider;
  sourceUrl: string;
}

export interface ParsedParticipantUrlResult {
  markdownLink: string;
  metadata: ParticipantUrlMovieMetadata;
}

export interface ParseParticipantUrlParams {
  link: string;
  signal?: AbortSignal;
}

export interface ParticipantUrlSource {
  sourceName: string;
  domains: string[];
  checkIsValidLink: (link: string) => boolean;
  parseLink: (params: ParseParticipantUrlParams) => Promise<ParsedParticipantUrlResult | null>;
}
