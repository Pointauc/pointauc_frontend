import {
  createDefaultVideoRequestSettings,
  VIDEO_REQUEST_SETTINGS_ID,
} from '@domains/video-requests/config/defaultSettings';
import {
  CreateRejectedVideoRequestInput,
  CreateVideoRequestHistoryInput,
  CreateVideoRequestInput,
  RejectedVideoRequest,
  VideoRequest,
  VideoRequestHistoryRecord,
  VideoRequestSettings,
  VideoRequestSettingsPatch,
} from '@domains/video-requests/model/types';

import { videoRequestsDb } from './videoRequestsDb';

const compareIsoAscending = <T extends { createdAt: string; id: string }>(left: T, right: T) =>
  left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);

const compareIsoDescending = <T extends { createdAt: string; id: string }>(left: T, right: T) =>
  right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id);

const compareCompletedAtDescending = (
  left: VideoRequestHistoryRecord,
  right: VideoRequestHistoryRecord,
) => right.completedAt.localeCompare(left.completedAt) || right.id.localeCompare(left.id);

const normalizeVideoRequestRecord = (record: VideoRequest): VideoRequest => ({
  ...record,
  bidSnapshot: record.bidSnapshot ?? null,
});

const normalizeVideoRequestSettings = (
  settings?: Partial<VideoRequestSettings> | null,
): VideoRequestSettings => {
  const defaults = createDefaultVideoRequestSettings();

  return {
    ...defaults,
    ...settings,
    supportedSourceIds: settings?.supportedSourceIds ?? defaults.supportedSourceIds,
    listening: {
      ...defaults.listening,
      ...settings?.listening,
      activeBidGroups: settings?.listening?.activeBidGroups ?? defaults.listening.activeBidGroups,
    },
    skipVoting: {
      ...defaults.skipVoting,
      ...settings?.skipVoting,
    },
    limits: {
      ...defaults.limits,
      ...settings?.limits,
    },
  };
};

const mergeVideoRequestSettings = (
  currentSettings: VideoRequestSettings,
  patch: VideoRequestSettingsPatch,
): VideoRequestSettings => ({
  ...currentSettings,
  ...patch,
  supportedSourceIds: patch.supportedSourceIds ?? currentSettings.supportedSourceIds,
  listening: {
    ...currentSettings.listening,
    ...patch.listening,
    activeBidGroups: patch.listening?.activeBidGroups ?? currentSettings.listening.activeBidGroups,
  },
  skipVoting: {
    ...currentSettings.skipVoting,
    ...patch.skipVoting,
  },
  limits: {
    ...currentSettings.limits,
    ...patch.limits,
  },
});

/**
 * Durable storage adapter for the video requests feature.
 * Settings are always normalized against defaults so additive schema changes
 * can safely roll out without breaking older IndexedDB records.
 */
class VideoRequestsRepository {
  async listRequests(): Promise<VideoRequest[]> {
    const records = await videoRequestsDb.requests.toArray();

    return records.map(normalizeVideoRequestRecord).sort(compareIsoAscending);
  }

  async getRequest(id: string): Promise<VideoRequest | null> {
    const record = await videoRequestsDb.requests.get(id);

    return record ? normalizeVideoRequestRecord(record) : null;
  }

  async createRequest(input: CreateVideoRequestInput): Promise<VideoRequest> {
    const createdAt = input.createdAt ?? new Date().toISOString();

    const record: VideoRequest = {
      id: input.id ?? crypto.randomUUID(),
      status: input.status ?? 'queued',
      createdAt,
      updatedAt: createdAt,
      bidId: input.bidId,
      requestedBy: input.requestedBy,
      sourceId: input.sourceId,
      requestText: input.requestText,
      bidSnapshot: input.bidSnapshot ?? null,
      metadata: input.metadata,
      parsedVideoReference: input.parsedVideoReference,
    };

    await videoRequestsDb.requests.add(record);

    return record;
  }

  async updateRequest(
    id: string,
    updates: Partial<Omit<VideoRequest, 'id' | 'createdAt'>>,
  ): Promise<VideoRequest | null> {
    const existingRecord = await this.getRequest(id);

    if (!existingRecord) {
      return null;
    }

    const updatedRecord: VideoRequest = {
      ...existingRecord,
      ...updates,
      id: existingRecord.id,
      createdAt: existingRecord.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await videoRequestsDb.requests.put(updatedRecord);

    return updatedRecord;
  }

  async deleteRequest(id: string): Promise<void> {
    await videoRequestsDb.requests.delete(id);
  }

  async clearRequests(): Promise<void> {
    await videoRequestsDb.requests.clear();
  }

  async getSettings(): Promise<VideoRequestSettings> {
    const record = await videoRequestsDb.settings.get(VIDEO_REQUEST_SETTINGS_ID);

    return normalizeVideoRequestSettings(record);
  }

  async saveSettings(patch: VideoRequestSettingsPatch): Promise<VideoRequestSettings> {
    const currentSettings = await this.getSettings();
    const mergedSettings = mergeVideoRequestSettings(currentSettings, patch);

    await videoRequestsDb.settings.put(mergedSettings);

    return mergedSettings;
  }

  async replaceSettings(settings: VideoRequestSettings): Promise<VideoRequestSettings> {
    const normalizedSettings = normalizeVideoRequestSettings(settings);

    await videoRequestsDb.settings.put(normalizedSettings);

    return normalizedSettings;
  }

  async appendRejection(
    input: CreateRejectedVideoRequestInput,
  ): Promise<RejectedVideoRequest> {
    const record: RejectedVideoRequest = {
      id: input.id ?? crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      bidId: input.bidId,
      requestedBy: input.requestedBy,
      source: input.source,
      reason: input.reason,
      requestText: input.requestText,
    };

    await videoRequestsDb.rejections.add(record);

    return record;
  }

  async listRejections(): Promise<RejectedVideoRequest[]> {
    const records = await videoRequestsDb.rejections.toArray();

    return records.sort(compareIsoDescending);
  }

  async clearRejections(): Promise<void> {
    await videoRequestsDb.rejections.clear();
  }

  async appendHistory(
    input: CreateVideoRequestHistoryInput,
  ): Promise<VideoRequestHistoryRecord> {
    const completedAt = input.completedAt ?? new Date().toISOString();
    const record: VideoRequestHistoryRecord = {
      ...input,
      completedAt,
      updatedAt: completedAt,
    };

    await videoRequestsDb.history.put(record);

    return record;
  }

  async listHistory(): Promise<VideoRequestHistoryRecord[]> {
    const records = await videoRequestsDb.history.toArray();

    return records.sort(compareCompletedAtDescending);
  }

  async clearHistory(): Promise<void> {
    await videoRequestsDb.history.clear();
  }
}

export const videoRequestsRepository = new VideoRequestsRepository();
