import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { ParticipantUrlVideoRequestMetadata } from '@domains/links/participant-url-parsing/types';
import { VideoRequest, VideoRequestBidGroup, VideoRequestSettings, VideoSourceId } from '@domains/video-requests/model/types';
import { Purchase } from '@reducers/Purchases/Purchases';
import { UserState } from '@reducers/User/User';
import * as Integration from '@models/integration';

export const VIDEO_REQUEST_REJECTION_REASONS = {
  unsupportedSource: 'unsupported_source',
  sourceDisabled: 'source_disabled',
  durationLimitExceeded: 'duration_limit_exceeded',
  requestLimitExceeded: 'request_limit_exceeded',
  queueLimitExceeded: 'queue_limit_exceeded',
} as const;

export const VIDEO_REQUEST_BID_GROUPS: VideoRequestBidGroup[] = ['donations', 'channelPoints'];

export const getVideoRequestBidGroup = (bid: Purchase): VideoRequestBidGroup =>
  bid.isDonation ? 'donations' : 'channelPoints';

export const getAvailableVideoRequestIntegrations = (
  authData: UserState['authData'],
): Record<VideoRequestBidGroup, Integration.Config[]> => ({
  donations: integrationUtils.groupBy.availability(integrations.donate, authData).available,
  channelPoints: integrationUtils.groupBy.availability(integrations.points, authData).available,
});

export const mapSourceMetadataToVideoSourceId = (
  metadata: ParticipantUrlVideoRequestMetadata,
): VideoSourceId => {
  if (metadata.source === 'youtube') {
    return 'youtube';
  }

  return metadata.sourceReference.kind === 'clip' ? 'twitchClip' : 'twitchVod';
};

export const buildParsedVideoReference = (
  sourceId: VideoSourceId,
  metadata: ParticipantUrlVideoRequestMetadata,
) => {
  const sourceReference = metadata.sourceReference;

  if (sourceId === 'youtube') {
    return {
      sourceId,
      sourceVideoId: String(sourceReference.videoId ?? ''),
      sourceUrl: metadata.canonicalUrl,
      canonicalUrl: metadata.canonicalUrl,
      embedUrl: metadata.player.embedUrl,
      startTimeSeconds: null,
    };
  }

  if (sourceId === 'twitchClip') {
    return {
      sourceId,
      sourceVideoId: String(sourceReference.slug ?? ''),
      sourceUrl: metadata.canonicalUrl,
      canonicalUrl: metadata.canonicalUrl,
      embedUrl: metadata.player.embedUrl,
      startTimeSeconds: null,
    };
  }

  return {
    sourceId,
    sourceVideoId: String(sourceReference.videoId ?? ''),
    sourceUrl: metadata.canonicalUrl,
    canonicalUrl: metadata.canonicalUrl,
    embedUrl: metadata.player.embedUrl,
    startTimeSeconds: typeof sourceReference.startsAtSeconds === 'number' ? sourceReference.startsAtSeconds : null,
  };
};

export const buildVideoRequestMetadataSnapshot = (
  metadata: ParticipantUrlVideoRequestMetadata,
) => ({
  title: metadata.title,
  authorName: metadata.channelName,
  thumbnailUrl: metadata.thumbnailUrl,
  durationSeconds: metadata.durationSeconds,
  canonicalUrl: metadata.canonicalUrl,
});

export const getVideoRequestValidationReason = ({
  queue,
  request,
  settings,
}: {
  queue: VideoRequest[];
  request: Pick<VideoRequest, 'requestedBy' | 'sourceId' | 'metadata'>;
  settings: VideoRequestSettings;
}): string | null => {
  if (!settings.supportedSourceIds.includes(request.sourceId)) {
    return VIDEO_REQUEST_REJECTION_REASONS.sourceDisabled;
  }

  if (settings.limits.maxQueueSize != null && queue.length >= settings.limits.maxQueueSize) {
    return VIDEO_REQUEST_REJECTION_REASONS.queueLimitExceeded;
  }

  if (
    settings.limits.maxDurationSeconds != null &&
    request.metadata.durationSeconds != null &&
    request.metadata.durationSeconds > settings.limits.maxDurationSeconds
  ) {
    return VIDEO_REQUEST_REJECTION_REASONS.durationLimitExceeded;
  }

  if (settings.limits.maxRequestsPerUser != null && request.requestedBy) {
    const userRequestCount = queue.filter((item) => item.requestedBy === request.requestedBy).length;

    if (userRequestCount >= settings.limits.maxRequestsPerUser) {
      return VIDEO_REQUEST_REJECTION_REASONS.requestLimitExceeded;
    }
  }

  return null;
};
