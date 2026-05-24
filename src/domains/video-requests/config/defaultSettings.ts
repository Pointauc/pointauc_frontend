import {
  VideoRequestSettings,
  VideoSourceId,
} from '@domains/video-requests/model/types';

export const VIDEO_REQUEST_SETTINGS_ID = 'video-request-settings';

const DEFAULT_SUPPORTED_SOURCE_IDS: VideoSourceId[] = ['youtube', 'twitchClip', 'twitchVod'];

export const createDefaultVideoRequestSettings = (): VideoRequestSettings => ({
  id: VIDEO_REQUEST_SETTINGS_ID,
  supportedSourceIds: [...DEFAULT_SUPPORTED_SOURCE_IDS],
  listening: {
    isEnabled: false,
    activeBidGroups: ['donations', 'channelPoints'],
  },
  isAutoplayEnabled: false,
  nextStrategy: 'requestOrder',
  skipVoting: {
    isEnabled: false,
    requiredVotes: 3,
  },
  limits: {
    maxDurationSeconds: null,
    maxRequestsPerUser: null,
    minViewCount: null,
    maxQueueSize: null,
    maxTotalDurationSeconds: null,
  },
});
