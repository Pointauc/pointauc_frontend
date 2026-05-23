export type VideoSourceId = 'youtube' | 'twitchClip' | 'twitchVod';
export type VideoRequestBidGroup = 'donations' | 'channelPoints';

export type VideoRequestStatus = 'queued' | 'playing' | 'watched' | 'skipped' | 'removed';

export type VideoRequestHistoryStatus = Extract<
  VideoRequestStatus,
  'watched' | 'skipped' | 'removed'
>;

export type VideoRequestNextStrategy = 'requestOrder' | 'random';

export interface VideoMetadata {
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  canonicalUrl: string;
}

export interface ParsedVideoReference {
  sourceId: VideoSourceId;
  sourceVideoId: string;
  sourceUrl: string;
  canonicalUrl: string;
  embedUrl: string | null;
  startTimeSeconds: number | null;
}

export interface VideoRequestBidSnapshot {
  id: string;
  source: Bid.Source;
  cost: number;
  username: string;
  message: string | null;
  timestamp: string;
  rewardId: string | null;
  isDonation: boolean;
}

export interface VideoRequest {
  id: string;
  bidId: string | null;
  status: VideoRequestStatus;
  createdAt: string;
  updatedAt: string;
  requestedBy: string | null;
  sourceId: VideoSourceId;
  requestText: string | null;
  bidSnapshot: VideoRequestBidSnapshot | null;
  metadata: VideoMetadata;
  parsedVideoReference: ParsedVideoReference;
}

export interface RejectedVideoRequest {
  id: string;
  bidId: string | null;
  createdAt: string;
  requestedBy: string | null;
  source: string | null;
  reason: string;
  requestText: string | null;
}

export interface SkipVoteState {
  chatChannel: string | null;
  requiredVotes: number;
  voterUsernames: string[];
}

export interface VideoRequestSettings {
  id: string;
  supportedSourceIds: VideoSourceId[];
  listening: {
    isEnabled: boolean;
    activeBidGroups: VideoRequestBidGroup[];
  };
  isAutoplayEnabled: boolean;
  nextStrategy: VideoRequestNextStrategy;
  skipVoting: {
    isEnabled: boolean;
    requiredVotes: number;
  };
  limits: {
    maxDurationSeconds: number | null;
    maxRequestsPerUser: number | null;
    maxQueueSize: number | null;
  };
}

export interface VideoRequestSettingsPatch {
  supportedSourceIds?: VideoSourceId[];
  listening?: Partial<VideoRequestSettings['listening']>;
  isAutoplayEnabled?: boolean;
  nextStrategy?: VideoRequestNextStrategy;
  skipVoting?: Partial<VideoRequestSettings['skipVoting']>;
  limits?: Partial<VideoRequestSettings['limits']>;
}

export interface VideoRequestHistoryRecord extends VideoRequest {
  status: VideoRequestHistoryStatus;
  completedAt: string;
}

export interface CreateVideoRequestInput
  extends Omit<VideoRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  id?: string;
  createdAt?: string;
  status?: VideoRequestStatus;
}

export interface CreateRejectedVideoRequestInput
  extends Omit<RejectedVideoRequest, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: string;
}

export interface CreateVideoRequestHistoryInput
  extends Omit<VideoRequestHistoryRecord, 'completedAt'> {
  completedAt?: string;
}
