// Shared contracts for participant URL parsing sources and parsing results.
export type ParticipantUrlParsingSource = 'imdb' | 'kinopoisk' | 'youtube' | 'twitch';

export type ParticipantUrlParsingProvider =
  | 'wikidata'
  | 'tmdb'
  | 'imdb-scrape'
  | 'kinopoisk-scrape'
  | 'kinopoisk-worker'
  | 'youtube-oembed'
  | 'youtube-data-api'
  | 'twitch-helix-clips'
  | 'twitch-helix-videos'
  | 'twitch-url-fallback';

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

export interface GetVideoRequestMetadataParams extends ParseParticipantUrlParams {
  parentHost?: string;
}

export interface ParticipantUrlVideoRequestPlayerData {
  kind: 'iframe';
  embedUrl: string;
  parentHost: string | null;
}

export interface ParticipantUrlVideoRequestMetadata {
  source: Extract<ParticipantUrlParsingSource, 'youtube' | 'twitch'>;
  provider: ParticipantUrlParsingProvider;
  canonicalUrl: string;
  player: ParticipantUrlVideoRequestPlayerData;
  title: string;
  channelName: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  sourceReference: Record<string, string | number | boolean | null>;
}

export interface ParticipantUrlSource {
  sourceName: string;
  domains: string[];
  checkIsValidLink: (link: string) => boolean;
  parseLink: (params: ParseParticipantUrlParams) => Promise<ParsedParticipantUrlResult | null>;
  /**
   * GetVideoRequestMetadata capability for playable video request sources.
   */
  getVideoRequestMetadata?: (
    params: GetVideoRequestMetadataParams,
  ) => Promise<ParticipantUrlVideoRequestMetadata | null>;
}
