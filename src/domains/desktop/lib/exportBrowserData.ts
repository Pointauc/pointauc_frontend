import {
  DesktopSyncDataPayload,
  ExportedIndexedDatabase,
  ExportedObjectStore,
  ExportedObjectStoreIndex,
  ExportedRecord,
} from '@domains/desktop/model/types';

export const KNOWN_POINTAUC_DATABASES: readonly string[] = [
  'pointauc-archive',
  'pointauc-auction-history',
  'pointauc-rules',
  'pointauc-app-settings',
  'pointauc-user-settings',
  'pointauc-video-requests',
];

export const serializeStorage = (storage: Storage): Record<string, string> => {
  const result: Record<string, string> = {};
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key !== null) {
        const value = storage.getItem(key);
        if (value !== null) {
          result[key] = value;
        }
      }
    }
  } catch {
    // Storage access might fail in restricted environments
  }
  return result;
};

export const discoverDatabaseNames = async (): Promise<string[]> => {
  const discovered = new Set<string>();

  if (typeof window !== 'undefined' && window.indexedDB && typeof window.indexedDB.databases === 'function') {
    try {
      const databaseInfos = await window.indexedDB.databases();
      for (const info of databaseInfos) {
        if (info.name) {
          discovered.add(info.name);
        }
      }
    } catch {
      // indexedDB.databases() might fail or not be supported
    }
  }

  for (const name of KNOWN_POINTAUC_DATABASES) {
    discovered.add(name);
  }

  return Array.from(discovered);
};

const readStoreRecords = (store: IDBObjectStore): Promise<ExportedRecord[]> => {
  return new Promise((resolve, reject) => {
    const records: ExportedRecord[] = [];
    let request: IDBRequest<IDBCursorWithValue | null>;
    try {
      request = store.openCursor();
    } catch (err) {
      reject(err);
      return;
    }

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        records.push({
          key: cursor.key,
          value: cursor.value,
        });
        cursor.continue();
      } else {
        resolve(records);
      }
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to read records from object store: ${store.name}`));
    };
  });
};

const openDatabaseForExport = (dbName: string): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    let isNewDb = false;
    let request: IDBOpenDBRequest;

    try {
      request = window.indexedDB.open(dbName);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = (event) => {
      if (event.oldVersion === 0) {
        isNewDb = true;
        try {
          request.transaction?.abort();
        } catch {
          // Ignore abort errors
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      if (isNewDb) {
        db.close();
        try {
          window.indexedDB.deleteDatabase(dbName);
        } catch {
          // Ignore deletion error
        }
        resolve(null);
        return;
      }
      resolve(db);
    };

    request.onerror = () => {
      resolve(null);
    };

    request.onblocked = () => {
      resolve(null);
    };
  });
};

export const exportSingleIndexedDatabase = async (dbName: string): Promise<ExportedIndexedDatabase | null> => {
  const db = await openDatabaseForExport(dbName);
  if (!db) {
    return null;
  }

  try {
    const storeNames = Array.from(db.objectStoreNames);
    if (storeNames.length === 0) {
      return {
        name: db.name,
        version: db.version,
        stores: [],
      };
    }

    const exportedStores: ExportedObjectStore[] = [];

    for (const storeName of storeNames) {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      const indexes: ExportedObjectStoreIndex[] = Array.from(store.indexNames).map((indexName) => {
        const index = store.index(indexName);
        return {
          name: index.name,
          keyPath: index.keyPath,
          unique: index.unique,
          multiEntry: index.multiEntry,
        };
      });

      const records = await readStoreRecords(store);

      exportedStores.push({
        name: store.name,
        keyPath: store.keyPath,
        autoIncrement: Boolean(store.autoIncrement),
        indexes,
        records,
      });
    }

    return {
      name: db.name,
      version: db.version,
      stores: exportedStores,
    };
  } finally {
    db.close();
  }
};

export const exportAllIndexedDatabases = async (): Promise<ExportedIndexedDatabase[]> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return [];
  }

  const databaseNames = await discoverDatabaseNames();
  const exportedDatabases: ExportedIndexedDatabase[] = [];

  for (const name of databaseNames) {
    try {
      const exportedDb = await exportSingleIndexedDatabase(name);
      if (exportedDb) {
        exportedDatabases.push(exportedDb);
      }
    } catch {
      // Skip problematic database
    }
  }

  return exportedDatabases;
};

export const exportBrowserData = async (): Promise<DesktopSyncDataPayload> => {
  const localStorageData =
    typeof window !== 'undefined' && window.localStorage ? serializeStorage(window.localStorage) : {};
  const sessionStorageData =
    typeof window !== 'undefined' && window.sessionStorage ? serializeStorage(window.sessionStorage) : {};

  const indexedDbData = await exportAllIndexedDatabases();

  return {
    localStorage: localStorageData,
    sessionStorage: sessionStorageData,
    indexedDb: indexedDbData,
  };
};
