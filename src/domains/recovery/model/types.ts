import { DesktopSyncDataPayload } from '@domains/desktop/model/types';

export interface RecoveryUploadPayload {
  userId?: number;
  data: DesktopSyncDataPayload;
  metadata?: {
    userAgent?: string;
    timestamp?: number;
    url?: string;
    localStorageCount?: number;
    indexedDbCount?: number;
    isStoragePersisted?: boolean;
  };
}

export interface RecoveryUploadResponse {
  success: boolean;
  id: number;
  message: string;
}

export interface RecoveryStatusState {
  step: 'idle' | 'collecting' | 'uploading' | 'success' | 'error';
  recoveryId?: number;
  error?: string;
  isStoragePersisted?: boolean;
  localStorageCount?: number;
  indexedDbCount?: number;
  dataPayload?: DesktopSyncDataPayload;
}
