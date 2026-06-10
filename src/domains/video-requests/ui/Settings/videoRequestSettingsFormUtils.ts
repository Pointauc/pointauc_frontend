import { VideoRequestSettings, VideoRequestSettingsPatch } from '@domains/video-requests/model/types';

export const secondsToMinutes = (seconds: number | null) => (seconds == null ? null : Math.round(seconds / 60));

export const minutesToSeconds = (minutes: number | null) => (minutes == null ? null : minutes * 60);

export const normalizeNumber = (value: string | number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
};

export const createVideoRequestSettingsPatch = (settings: VideoRequestSettings): VideoRequestSettingsPatch => ({
  supportedSourceIds: settings.supportedSourceIds,
  isAutoplayEnabled: settings.isAutoplayEnabled,
  nextStrategy: settings.nextStrategy,
  skipVoting: settings.skipVoting,
  limits: settings.limits,
});
