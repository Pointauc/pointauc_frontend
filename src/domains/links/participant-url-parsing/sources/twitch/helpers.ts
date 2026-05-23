export const TWITCH_SUPPORTED_DOMAINS = [
  'twitch.tv',
  'www.twitch.tv',
  'm.twitch.tv',
  'clips.twitch.tv',
  'player.twitch.tv',
];

export interface TwitchClipReference {
  kind: 'clip';
  slug: string;
  channelName: string | null;
}

export interface TwitchVideoReference {
  kind: 'video';
  videoId: string;
  startsAtSeconds: number | null;
}

export type TwitchVideoRequestReference = TwitchClipReference | TwitchVideoReference;

const TWITCH_CLIP_SLUG_REGEXP = /^[A-Za-z0-9_-]+$/;
const TWITCH_VIDEO_ID_REGEXP = /^\d+$/;
const TWITCH_TIMESTAMP_PART_REGEXP = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i;

const getUrlInstance = (value: string | null | undefined): URL | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
};

const getNormalizedDomain = (url: URL): string => url.hostname.trim().toLowerCase().replace(/^www\./, '');

const getPathSegments = (url: URL): string[] => {
  return url.pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);
};

export const getTwitchParentHost = (parentHost?: string): string | null => {
  if (parentHost?.trim()) {
    return parentHost.trim();
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }

  return null;
};

export const getSecondsFromTwitchTimestamp = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().replace(/^PT/i, '');
  const match = normalizedValue.match(TWITCH_TIMESTAMP_PART_REGEXP);
  if (!match || match[0] !== normalizedValue) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : null;
};

export const extractTwitchClipReference = (value: string | null | undefined): TwitchClipReference | null => {
  const url = getUrlInstance(value);
  if (!url) {
    return null;
  }

  const normalizedDomain = getNormalizedDomain(url);
  const pathSegments = getPathSegments(url);

  if (normalizedDomain === 'clips.twitch.tv') {
    const [slug] = pathSegments;
    return slug && TWITCH_CLIP_SLUG_REGEXP.test(slug)
      ? {
          kind: 'clip',
          slug,
          channelName: null,
        }
      : null;
  }

  if (normalizedDomain === 'twitch.tv' || normalizedDomain === 'm.twitch.tv') {
    const [channelName, clipPath, slug] = pathSegments;
    if (channelName && clipPath?.toLowerCase() === 'clip' && slug && TWITCH_CLIP_SLUG_REGEXP.test(slug)) {
      return {
        kind: 'clip',
        slug,
        channelName,
      };
    }
  }

  return null;
};

export const extractTwitchVideoReference = (value: string | null | undefined): TwitchVideoReference | null => {
  const url = getUrlInstance(value);
  if (!url) {
    return null;
  }

  const normalizedDomain = getNormalizedDomain(url);
  const pathSegments = getPathSegments(url);
  const timestampSeconds = getSecondsFromTwitchTimestamp(url.searchParams.get('t'));

  if (normalizedDomain === 'player.twitch.tv') {
    const queryVideoId = url.searchParams.get('video')?.trim().replace(/^v/i, '');
    return queryVideoId && TWITCH_VIDEO_ID_REGEXP.test(queryVideoId)
      ? {
          kind: 'video',
          videoId: queryVideoId,
          startsAtSeconds: timestampSeconds,
        }
      : null;
  }

  if (normalizedDomain !== 'twitch.tv' && normalizedDomain !== 'm.twitch.tv') {
    return null;
  }

  const [videosPath, videoId] = pathSegments;
  if (videosPath?.toLowerCase() !== 'videos' || !videoId || !TWITCH_VIDEO_ID_REGEXP.test(videoId)) {
    return null;
  }

  return {
    kind: 'video',
    videoId,
    startsAtSeconds: timestampSeconds,
  };
};

export const extractTwitchVideoRequestReference = (value: string | null | undefined): TwitchVideoRequestReference | null => {
  return extractTwitchClipReference(value) ?? extractTwitchVideoReference(value);
};

export const buildTwitchClipUrl = (slug: string): string => `https://clips.twitch.tv/${slug}`;

export const buildTwitchVideoUrl = (videoId: string, startsAtSeconds?: number | null): string => {
  const url = new URL(`https://www.twitch.tv/videos/${videoId}`);
  if (startsAtSeconds) {
    url.searchParams.set('t', `${startsAtSeconds}s`);
  }

  return url.toString();
};

export const buildTwitchClipEmbedUrl = (slug: string, parentHost?: string): string => {
  const url = new URL('https://clips.twitch.tv/embed');
  url.searchParams.set('clip', slug);

  const resolvedParentHost = getTwitchParentHost(parentHost);
  if (resolvedParentHost) {
    url.searchParams.set('parent', resolvedParentHost);
  }

  return url.toString();
};

export const buildTwitchVideoEmbedUrl = (
  videoId: string,
  startsAtSeconds?: number | null,
  parentHost?: string,
): string => {
  const url = new URL('https://player.twitch.tv/');
  url.searchParams.set('video', `v${videoId}`);

  const resolvedParentHost = getTwitchParentHost(parentHost);
  if (resolvedParentHost) {
    url.searchParams.set('parent', resolvedParentHost);
  }

  if (startsAtSeconds) {
    url.searchParams.set('time', `${startsAtSeconds}s`);
  }

  return url.toString();
};

export const checkIsTwitchVideoRequestUrl = (value: string): boolean => {
  return extractTwitchVideoRequestReference(value) != null;
};
