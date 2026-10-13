import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backendApi } from '@api/backendApi';
import {
  claimDesktopSyncSession,
  createDesktopSyncSession,
  fetchDesktopSyncStatus,
  uploadDesktopSyncData,
} from '@domains/desktop/api/desktopSyncApi';
import {
  checkIsDesktopSetupCompleted,
  DESKTOP_SETUP_COMPLETED_KEY,
  markDesktopSetupCompleted,
  resetDesktopSetup,
} from '@domains/desktop/lib/desktopSetupStorage';
import {
  discoverDatabaseNames,
  exportBrowserData,
  KNOWN_POINTAUC_DATABASES,
  serializeStorage,
} from '@domains/desktop/lib/exportBrowserData';
import { importDesktopData } from '@domains/desktop/lib/importDesktopData';
import { parseDesktopSyncProtocol } from '@domains/desktop/lib/parseDesktopSyncProtocol';
import { DesktopSyncDataPayload } from '@domains/desktop/model/types';

interface MockStoreData {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: { name: string; keyPath: string | string[]; unique: boolean; multiEntry: boolean }[];
  records: { key?: IDBValidKey; value: unknown }[];
}

interface MockDbData {
  name: string;
  version: number;
  stores: Record<string, MockStoreData>;
}

describe('Desktop Data Sync Engine', () => {
  let mockDatabases: Record<string, MockDbData> = {};

  const setupMockIndexedDB = () => {
    mockDatabases = {};

    const mockIDB = {
      databases: vi.fn(async () => {
        return Object.values(mockDatabases).map((db) => ({ name: db.name, version: db.version }));
      }),
      deleteDatabase: vi.fn((name: string) => {
        delete mockDatabases[name];
        const request: {
          onsuccess: (() => void) | null;
          onerror: (() => void) | null;
          onblocked: (() => void) | null;
        } = {
          onsuccess: null,
          onerror: null,
          onblocked: null,
        };
        setTimeout(() => {
          request.onsuccess?.();
        }, 0);
        return request as unknown as IDBOpenDBRequest;
      }),
      open: vi.fn((name: string, version?: number) => {
        const isUpgrade = version !== undefined;
        let isAborted = false;

        const request: {
          result: any;
          error: any;
          transaction: any;
          onsuccess: (() => void) | null;
          onerror: (() => void) | null;
          onupgradeneeded: ((event: any) => void) | null;
          onblocked: (() => void) | null;
        } = {
          result: null,
          error: null,
          transaction: {
            abort: () => {
              isAborted = true;
            },
          },
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
          onblocked: null,
        };

        setTimeout(() => {
          if (isUpgrade) {
            let dbData = mockDatabases[name];
            if (!dbData) {
              dbData = { name, version, stores: {} };
              mockDatabases[name] = dbData;
            } else {
              dbData.version = version;
            }

            const dbMock = {
              name,
              version,
              objectStoreNames: {
                contains: (storeName: string) => Boolean(dbData.stores[storeName]),
                get length() {
                  return Object.keys(dbData.stores).length;
                },
                [Symbol.iterator]: function* () {
                  yield* Object.keys(dbData.stores);
                },
              },
              createObjectStore: (storeName: string, options?: IDBObjectStoreParameters) => {
                const storeData: MockStoreData = {
                  name: storeName,
                  keyPath: options?.keyPath ?? null,
                  autoIncrement: Boolean(options?.autoIncrement),
                  indexes: [],
                  records: [],
                };
                dbData.stores[storeName] = storeData;

                return {
                  name: storeName,
                  keyPath: storeData.keyPath,
                  autoIncrement: storeData.autoIncrement,
                  createIndex: (indexName: string, keyPath: string | string[], indexOptions?: IDBIndexParameters) => {
                    storeData.indexes.push({
                      name: indexName,
                      keyPath,
                      unique: Boolean(indexOptions?.unique),
                      multiEntry: Boolean(indexOptions?.multiEntry),
                    });
                  },
                };
              },
              transaction: (storeNames: string | string[], mode: string) => {
                const names = Array.isArray(storeNames) ? storeNames : [storeNames];
                const tx: {
                  oncomplete: (() => void) | null;
                  onerror: (() => void) | null;
                  objectStore: (storeName: string) => any;
                } = {
                  oncomplete: null,
                  onerror: null,
                  objectStore: (storeName: string) => ({
                    put: (value: unknown, key?: IDBValidKey) => {
                      const store = dbData.stores[storeName];
                      if (store) {
                        store.records.push({ key, value });
                      }
                    },
                  }),
                };
                setTimeout(() => {
                  tx.oncomplete?.();
                }, 0);
                return tx;
              },
              close: vi.fn(),
            };

            request.result = dbMock;
            request.onupgradeneeded?.({ oldVersion: 0, newVersion: version, target: request });

            setTimeout(() => {
              request.onsuccess?.();
            }, 0);
          } else {
            // Open existing
            const dbData = mockDatabases[name];
            if (!dbData) {
              // Simulated attempt to open non-existent DB
              request.onupgradeneeded?.({ oldVersion: 0, newVersion: 1, target: request });
              if (isAborted) {
                request.error = new Error('AbortError');
                request.onerror?.();
                return;
              }
            }

            const activeDbData = dbData ?? { name, version: 1, stores: {} };
            const dbMock = {
              name,
              version: activeDbData.version,
              objectStoreNames: {
                contains: (storeName: string) => Boolean(activeDbData.stores[storeName]),
                get length() {
                  return Object.keys(activeDbData.stores).length;
                },
                [Symbol.iterator]: function* () {
                  yield* Object.keys(activeDbData.stores);
                },
              },
              transaction: (storeName: string, mode: string) => {
                const storeData = activeDbData.stores[storeName];
                return {
                  objectStore: () => ({
                    name: storeData.name,
                    keyPath: storeData.keyPath,
                    autoIncrement: storeData.autoIncrement,
                    indexNames: {
                      [Symbol.iterator]: function* () {
                        yield* storeData.indexes.map((idx) => idx.name);
                      },
                    },
                    index: (idxName: string) => {
                      return storeData.indexes.find((i) => i.name === idxName);
                    },
                    openCursor: () => {
                      let cursorIndex = 0;
                      const req: { result: any; error: any; onsuccess: (() => void) | null; onerror: (() => void) | null } =
                        {
                          result: null,
                          error: null,
                          onsuccess: null,
                          onerror: null,
                        };

                      const dispatchCursor = () => {
                        if (cursorIndex < storeData.records.length) {
                          const currentRecord = storeData.records[cursorIndex];
                          req.result = {
                            key: currentRecord.key,
                            value: currentRecord.value,
                            continue: () => {
                              cursorIndex += 1;
                              setTimeout(dispatchCursor, 0);
                            },
                          };
                        } else {
                          req.result = null;
                        }
                        req.onsuccess?.();
                      };

                      setTimeout(dispatchCursor, 0);
                      return req;
                    },
                  }),
                };
              },
              close: vi.fn(),
            };

            request.result = dbMock;
            request.onsuccess?.();
          }
        }, 0);

        return request as unknown as IDBOpenDBRequest;
      }),
    };

    vi.stubGlobal('indexedDB', mockIDB);
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setupMockIndexedDB();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('desktopSetupStorage', () => {
    it('manages setup completion status in localStorage', () => {
      expect(checkIsDesktopSetupCompleted()).toBe(false);
      expect(localStorage.getItem(DESKTOP_SETUP_COMPLETED_KEY)).toBeNull();

      markDesktopSetupCompleted();
      expect(checkIsDesktopSetupCompleted()).toBe(true);
      expect(localStorage.getItem(DESKTOP_SETUP_COMPLETED_KEY)).toBe('true');

      resetDesktopSetup();
      expect(checkIsDesktopSetupCompleted()).toBe(false);
      expect(localStorage.getItem(DESKTOP_SETUP_COMPLETED_KEY)).toBeNull();
    });
  });

  describe('exportBrowserData', () => {
    it('serializes storage and discovers known databases', async () => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('lang', 'ru');

      const serialized = serializeStorage(localStorage);
      expect(serialized).toEqual({ theme: 'dark', lang: 'ru' });

      const dbs = await discoverDatabaseNames();
      for (const knownName of KNOWN_POINTAUC_DATABASES) {
        expect(dbs).toContain(knownName);
      }
    });

    it('exports all browser storage and indexed databases into sync payload', async () => {
      localStorage.setItem('local_key', 'local_value');
      sessionStorage.setItem('session_key', 'session_value');

      // Populate mock indexedDB database
      mockDatabases['pointauc-archive'] = {
        name: 'pointauc-archive',
        version: 1,
        stores: {
          archives: {
            name: 'archives',
            keyPath: 'id',
            autoIncrement: false,
            indexes: [
              {
                name: 'isAutosave',
                keyPath: 'isAutosave',
                unique: false,
                multiEntry: false,
              },
            ],
            records: [
              {
                key: 'arc-123',
                value: { id: 'arc-123', title: 'Saved Auction' },
              },
            ],
          },
        },
      };

      const payload = await exportBrowserData();

      expect(payload.localStorage).toEqual({ local_key: 'local_value' });
      expect(payload.sessionStorage).toEqual({ session_key: 'session_value' });
      expect(payload.indexedDb).toHaveLength(1);

      const exportedDb = payload.indexedDb[0];
      expect(exportedDb.name).toBe('pointauc-archive');
      expect(exportedDb.version).toBe(1);
      expect(exportedDb.stores).toHaveLength(1);

      const store = exportedDb.stores[0];
      expect(store.name).toBe('archives');
      expect(store.keyPath).toBe('id');
      expect(store.autoIncrement).toBe(false);
      expect(store.indexes).toEqual([
        {
          name: 'isAutosave',
          keyPath: 'isAutosave',
          unique: false,
          multiEntry: false,
        },
      ]);
      expect(store.records).toEqual([
        {
          key: 'arc-123',
          value: { id: 'arc-123', title: 'Saved Auction' },
        },
      ]);
    });
  });

  describe('importDesktopData', () => {
    it('restores localStorage, sessionStorage, and IndexedDB and marks setup completed', async () => {
      localStorage.setItem('old_key', 'old_val');
      sessionStorage.setItem('old_session', 'old_session_val');

      const testPayload: DesktopSyncDataPayload = {
        localStorage: {
          imported_setting: 'true',
          user_name: 'test_streamer',
        },
        sessionStorage: {
          auth_token: 'secret-token-xyz',
        },
        indexedDb: [
          {
            name: 'pointauc-rules',
            version: 2,
            stores: [
              {
                name: 'rules_store',
                keyPath: 'id',
                autoIncrement: true,
                indexes: [
                  {
                    name: 'name_idx',
                    keyPath: 'name',
                    unique: true,
                    multiEntry: false,
                  },
                ],
                records: [
                  {
                    key: 1,
                    value: { id: 1, name: 'Rule 1' },
                  },
                ],
              },
              {
                name: 'keyless_store',
                keyPath: null,
                autoIncrement: false,
                indexes: [],
                records: [
                  {
                    key: 'out_of_line_key',
                    value: { data: 999 },
                  },
                ],
              },
            ],
          },
        ],
      };

      await importDesktopData(testPayload);

      // Verify localStorage restoration
      expect(localStorage.getItem('old_key')).toBeNull();
      expect(localStorage.getItem('imported_setting')).toBe('true');
      expect(localStorage.getItem('user_name')).toBe('test_streamer');

      // Verify sessionStorage restoration
      expect(sessionStorage.getItem('old_session')).toBeNull();
      expect(sessionStorage.getItem('auth_token')).toBe('secret-token-xyz');

      // Verify IndexedDB restoration
      const restoredDb = mockDatabases['pointauc-rules'];
      expect(restoredDb).toBeDefined();
      expect(restoredDb.version).toBe(2);
      expect(Object.keys(restoredDb.stores)).toEqual(['rules_store', 'keyless_store']);

      const rulesStore = restoredDb.stores.rules_store;
      expect(rulesStore.keyPath).toBe('id');
      expect(rulesStore.autoIncrement).toBe(true);
      expect(rulesStore.indexes[0].name).toBe('name_idx');
      expect(rulesStore.records[0].value).toEqual({ id: 1, name: 'Rule 1' });

      const keylessStore = restoredDb.stores.keyless_store;
      expect(keylessStore.keyPath).toBeNull();
      expect(keylessStore.records[0].key).toBe('out_of_line_key');
      expect(keylessStore.records[0].value).toEqual({ data: 999 });

      // Verify setup completion marked
      expect(checkIsDesktopSetupCompleted()).toBe(true);
    });
  });

  describe('desktopSyncApi', () => {
    it('calls backendApi endpoints with correct arguments', async () => {
      vi.spyOn(backendApi, 'post').mockImplementation(async (url: string, data?: any) => {
        if (url === '/api/data-sync/session') {
          return { data: { sessionId: 'sess-123', claimToken: 'token-abc' } } as any;
        }
        if (url === '/api/data-sync/claim') {
          return { data: { success: true, userId: 101, data: { localStorage: {}, sessionStorage: {}, indexedDb: [] } } } as any;
        }
        if (url === '/api/data-sync/upload') {
          return { data: {} } as any;
        }
        return { data: {} } as any;
      });

      vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
        if (url.startsWith('/api/data-sync/status/')) {
          return { data: { status: 'READY' } } as any;
        }
        return { data: {} } as any;
      });

      const session = await createDesktopSyncSession();
      expect(session).toEqual({ sessionId: 'sess-123', claimToken: 'token-abc' });
      expect(backendApi.post).toHaveBeenCalledWith('/api/data-sync/session');

      const status = await fetchDesktopSyncStatus('sess-123');
      expect(status).toEqual({ status: 'READY' });
      expect(backendApi.get).toHaveBeenCalledWith('/api/data-sync/status/sess-123');

      const samplePayload: DesktopSyncDataPayload = {
        localStorage: { key: 'val' },
        sessionStorage: {},
        indexedDb: [],
      };
      await uploadDesktopSyncData('sess-123', samplePayload);
      expect(backendApi.post).toHaveBeenCalledWith('/api/data-sync/upload', {
        sessionId: 'sess-123',
        data: samplePayload,
      });

      const claimResult = await claimDesktopSyncSession('sess-123', 'token-abc');
      expect(claimResult.success).toBe(true);
      expect(claimResult.userId).toBe(101);
      expect(backendApi.post).toHaveBeenCalledWith('/api/data-sync/claim', {
        sessionId: 'sess-123',
        claimToken: 'token-abc',
      });
    });
  });

  describe('parseDesktopSyncProtocol', () => {
    it('extracts session ID from pointauc://desktop-sync URLs', () => {
      expect(parseDesktopSyncProtocol('pointauc://desktop-sync?session=abc-123')).toBe('abc-123');
      expect(parseDesktopSyncProtocol('pointauc://desktop-sync/?session=def-456')).toBe('def-456');
      expect(parseDesktopSyncProtocol('pointauc://desktop-sync?sessionId=ghi-789')).toBe('ghi-789');
      expect(parseDesktopSyncProtocol('pointauc:///desktop-sync?session=jkl-012')).toBe('jkl-012');
      expect(parseDesktopSyncProtocol('pointauc://oauth-callback?provider=twitch')).toBeUndefined();
      expect(parseDesktopSyncProtocol('https://pointauc.com/desktop-sync?session=123')).toBeUndefined();
      expect(parseDesktopSyncProtocol('invalid-url')).toBeUndefined();
    });
  });
});
