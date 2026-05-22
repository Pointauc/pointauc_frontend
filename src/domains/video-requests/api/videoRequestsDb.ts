import Dexie, { type EntityTable } from 'dexie';

import {
  RejectedVideoRequest,
  VideoRequest,
  VideoRequestHistoryRecord,
  VideoRequestSettings,
} from '@domains/video-requests/model/types';

class VideoRequestsDatabase extends Dexie {
  requests!: EntityTable<VideoRequest, 'id'>;
  settings!: EntityTable<VideoRequestSettings, 'id'>;
  rejections!: EntityTable<RejectedVideoRequest, 'id'>;
  history!: EntityTable<VideoRequestHistoryRecord, 'id'>;

  constructor() {
    super('pointauc-video-requests');
    this.version(1).stores({
      requests: 'id, status, createdAt, updatedAt, requestedBy, sourceId, bidId',
      settings: 'id',
      rejections: 'id, createdAt, requestedBy, bidId, source',
      history: 'id, status, completedAt, requestedBy, sourceId',
    });
  }
}

export const videoRequestsDb = new VideoRequestsDatabase();
