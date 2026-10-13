import { DesktopSyncDataPayload } from '@domains/desktop/model/types';

export const checkIsValidSyncPayload = (data: unknown): data is DesktopSyncDataPayload => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const candidate = data as Partial<DesktopSyncDataPayload>;
  const hasLocalStorage =
    typeof candidate.localStorage === 'object' && candidate.localStorage !== null && !Array.isArray(candidate.localStorage);
  const hasSessionStorage =
    typeof candidate.sessionStorage === 'object' &&
    candidate.sessionStorage !== null &&
    !Array.isArray(candidate.sessionStorage);
  const hasIndexedDb = Array.isArray(candidate.indexedDb);

  return hasLocalStorage || hasSessionStorage || hasIndexedDb;
};

export interface SyncPayloadSummary {
  archivesCount: number;
  settingsCount: number;
  detectedUsername?: string;
}

export const getSyncPayloadSummary = (payload: DesktopSyncDataPayload): SyncPayloadSummary => {
  let archivesCount = 0;

  if (Array.isArray(payload.indexedDb)) {
    for (const database of payload.indexedDb) {
      if (Array.isArray(database.stores)) {
        for (const store of database.stores) {
          archivesCount += store.records?.length || 0;
        }
      }
    }
  }

  const settingsCount = Object.keys(payload.localStorage || {}).length;

  let detectedUsername: string | undefined;
  if (payload.localStorage) {
    if (typeof payload.localStorage.pointauc_username === 'string') {
      detectedUsername = payload.localStorage.pointauc_username;
    } else if (typeof payload.localStorage.username === 'string') {
      detectedUsername = payload.localStorage.username;
    }
  }

  return {
    archivesCount,
    settingsCount,
    detectedUsername,
  };
};
