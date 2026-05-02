// Shared contracts for participant URL parsing sources and parsing results.
export type ParticipantUrlParsingSource = 'imdb' | 'kinopoisk' | 'youtube';

export type ParticipantUrlParsingProvider =
  | 'wikidata'
  | 'tmdb'
  | 'imdb-scrape'
  | 'kinopoisk-scrape'
  | 'kinopoisk-worker'
  | 'youtube-oembed';

interface ParticipantUrlBaseMetadata {
  title: string;
  source: ParticipantUrlParsingSource;
  provider: ParticipantUrlParsingProvider;
  sourceUrl: string;
}

export interface ParticipantUrlMovieMetadata extends ParticipantUrlBaseMetadata {
  kind: 'movie';
  imdbTitleId: string;
  year: number | null;
  runtimeMinutes: number | null;
  rating: number | null;
}

export interface ParticipantUrlVideoMetadata extends ParticipantUrlBaseMetadata {
  kind: 'video';
  videoId: string;
}

export type ParticipantUrlMetadata = ParticipantUrlMovieMetadata | ParticipantUrlVideoMetadata;

export interface ParsedParticipantUrlResult {
  markdownLink: string;
  metadata: ParticipantUrlMetadata;
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
