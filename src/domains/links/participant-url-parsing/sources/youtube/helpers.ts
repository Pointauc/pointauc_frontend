// YouTube-specific URL and identifier helpers.
const YOUTUBE_VIDEO_ID_REGEXP = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_PATH_PREFIXES = ['embed', 'shorts', 'live', 'v', 'e'];
const YOUTUBE_REDIRECT_QUERY_KEYS = ['url', 'u', 'q'];

export const YOUTUBE_SUPPORTED_DOMAINS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'gaming.youtube.com',
  'kids.youtube.com',
  'studio.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
]);

const checkIsValidYoutubeVideoId = (value: string | null | undefined): value is string => {
  return value != null && YOUTUBE_VIDEO_ID_REGEXP.test(value);
};

const getPotentialVideoIdFromPathname = (pathname: string): string | null => {
  const pathSegments = pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  const [firstPathSegment, secondPathSegment] = pathSegments;
  const normalizedFirstPathSegment = firstPathSegment.toLowerCase();

  if (YOUTUBE_PATH_PREFIXES.includes(normalizedFirstPathSegment) && checkIsValidYoutubeVideoId(secondPathSegment)) {
    return secondPathSegment;
  }

  if (checkIsValidYoutubeVideoId(firstPathSegment)) {
    return firstPathSegment;
  }

  return null;
};

const getRedirectTargetUrl = (url: URL): string | null => {
  for (const queryKey of YOUTUBE_REDIRECT_QUERY_KEYS) {
    const queryValue = url.searchParams.get(queryKey)?.trim();
    if (!queryValue) {
      continue;
    }

    if (queryValue.startsWith('/')) {
      return `https://www.youtube.com${queryValue}`;
    }

    return queryValue;
  }

  return null;
};

const extractYoutubeVideoIdFromUrlInstance = (url: URL): string | null => {
  const normalizedDomain = url.hostname.trim().toLowerCase().replace(/^www\./, '');

  if (normalizedDomain === 'youtu.be') {
    return getPotentialVideoIdFromPathname(url.pathname);
  }

  if (!YOUTUBE_SUPPORTED_DOMAINS.has(normalizedDomain)) {
    return null;
  }

  const queryVideoId = url.searchParams.get('v')?.trim();
  if (checkIsValidYoutubeVideoId(queryVideoId)) {
    return queryVideoId;
  }

  const redirectTargetUrl = getRedirectTargetUrl(url);
  if (redirectTargetUrl) {
    return extractYoutubeVideoId(redirectTargetUrl);
  }

  return getPotentialVideoIdFromPathname(url.pathname);
};

export const buildYoutubeVideoUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;

export const extractYoutubeVideoId = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  try {
    return extractYoutubeVideoIdFromUrlInstance(new URL(value));
  } catch {
    try {
      return extractYoutubeVideoIdFromUrlInstance(new URL(`https://${value}`));
    } catch {
      return null;
    }
  }
};

export const checkIsYoutubeVideoUrl = (value: string): boolean => {
  return extractYoutubeVideoId(value) != null;
};
