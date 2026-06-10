import dayjs from 'dayjs';

import { VideoMetadata } from '@domains/video-requests/model/types';

export const getVideoRequestTitle = (metadata: VideoMetadata) => metadata.title?.trim() || metadata.canonicalUrl;

export const formatDuration = (seconds: number | null | undefined) => {
  if (seconds == null) {
    return null;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedMinutes = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
};

export const formatCompactNumber = (value: number | null | undefined) => {
  if (value == null) {
    return null;
  }

  return Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatBidAmount = (value: number | null | undefined) => {
  if (value == null) {
    return null;
  }

  return Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatLikePercentage = (likeCount: number | null | undefined, viewCount: number | null | undefined) => {
  if (likeCount == null || viewCount == null || viewCount <= 0) {
    return null;
  }

  return `${Math.min(100, Math.round((likeCount / viewCount) * 100))}%`;
};

export const formatRelativeDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  return dayjs(value).fromNow();
};
