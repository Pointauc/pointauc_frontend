export interface ExportedRecord {
  key?: IDBValidKey;
  value: unknown;
}

export interface ExportedObjectStoreIndex {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry: boolean;
}

export interface ExportedObjectStore {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: ExportedObjectStoreIndex[];
  records: ExportedRecord[];
}

export interface ExportedIndexedDatabase {
  name: string;
  version: number;
  stores: ExportedObjectStore[];
}

export interface DesktopSyncDataPayload {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  indexedDb: ExportedIndexedDatabase[];
}

export interface DesktopSyncSession {
  sessionId: string;
  claimToken: string;
}

export type DesktopSyncStatus = 'PENDING' | 'READY' | 'CLAIMED' | 'EXPIRED';

export interface DesktopSyncStatusResponse {
  status: DesktopSyncStatus;
}

export interface DesktopSyncClaimResponse {
  success: boolean;
  userId: number;
  data: DesktopSyncDataPayload;
}
