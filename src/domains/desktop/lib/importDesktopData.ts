import { markDesktopSetupCompleted } from '@domains/desktop/lib/desktopSetupStorage';
import { DesktopSyncDataPayload, ExportedIndexedDatabase } from '@domains/desktop/model/types';

export const restoreStorage = (storage: Storage, data: Record<string, string>): void => {
  try {
    storage.clear();
    for (const [key, value] of Object.entries(data)) {
      storage.setItem(key, value);
    }
  } catch {
    // Ignore storage write errors
  }
};

const deleteDatabaseAsync = (dbName: string): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
};

export const restoreSingleDatabase = (dbData: ExportedIndexedDatabase): Promise<void> => {
  return new Promise((resolve, reject) => {
    const version = Math.max(1, dbData.version || 1);
    let request: IDBOpenDBRequest;

    try {
      request = window.indexedDB.open(dbData.name, version);
    } catch (err) {
      reject(err);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeData of dbData.stores) {
        const storeOptions: IDBObjectStoreParameters = {};
        if (storeData.keyPath !== null && storeData.keyPath !== undefined) {
          storeOptions.keyPath = storeData.keyPath;
        }
        if (storeData.autoIncrement) {
          storeOptions.autoIncrement = true;
        }

        const store = db.createObjectStore(storeData.name, storeOptions);

        for (const indexData of storeData.indexes) {
          store.createIndex(indexData.name, indexData.keyPath, {
            unique: indexData.unique,
            multiEntry: indexData.multiEntry,
          });
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const storeNames = dbData.stores
        .map((store) => store.name)
        .filter((name) => db.objectStoreNames.contains(name));

      if (storeNames.length === 0) {
        db.close();
        resolve();
        return;
      }

      const transaction = db.transaction(storeNames, 'readwrite');

      for (const storeData of dbData.stores) {
        if (!db.objectStoreNames.contains(storeData.name)) {
          continue;
        }

        const store = transaction.objectStore(storeData.name);
        for (const record of storeData.records) {
          if (storeData.keyPath !== null && storeData.keyPath !== undefined) {
            store.put(record.value);
          } else if (record.key !== undefined) {
            store.put(record.value, record.key);
          } else {
            store.put(record.value);
          }
        }
      }

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        const error = transaction.error ?? new Error(`Failed to write records to ${dbData.name}`);
        db.close();
        reject(error);
      };
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to open database ${dbData.name}`));
    };
  });
};

export const importDesktopData = async (payload: DesktopSyncDataPayload): Promise<void> => {
  if (typeof window !== 'undefined' && window.localStorage && payload.localStorage) {
    restoreStorage(window.localStorage, payload.localStorage);
  }

  if (typeof window !== 'undefined' && window.sessionStorage && payload.sessionStorage) {
    restoreStorage(window.sessionStorage, payload.sessionStorage);
  }

  if (typeof window !== 'undefined' && window.indexedDB && Array.isArray(payload.indexedDb)) {
    for (const dbData of payload.indexedDb) {
      await deleteDatabaseAsync(dbData.name);
      await restoreSingleDatabase(dbData);
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const userSession =
        payload.localStorage?.pointauc_cookie_userSession ||
        (typeof window !== 'undefined' && window.localStorage?.getItem('pointauc_cookie_userSession'));
      const userSessionSig =
        payload.localStorage?.pointauc_cookie_userSession_sig ||
        (typeof window !== 'undefined' && window.localStorage?.getItem('pointauc_cookie_userSession_sig'));

      if (userSession) {
        document.cookie = `userSession=${userSession}; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (userSessionSig) {
        document.cookie = `userSession.sig=${userSessionSig}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore cookie restoration error in restricted environments
    }
  }

  markDesktopSetupCompleted();
};
