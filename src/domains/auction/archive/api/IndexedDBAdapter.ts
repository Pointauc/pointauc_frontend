import { ArchiveData, ArchiveRecord, CreateArchiveInput } from '../model/types';
import { ARCHIVE_DB_NAME, ARCHIVE_STORE_NAME, AUTOSAVE_ID } from '../model/constants';

import ArchiveApi from './ArchiveApi';

class IndexedDBAdapter extends ArchiveApi {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Opens or creates the IndexedDB database
   */
  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(ARCHIVE_DB_NAME, 1);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(ARCHIVE_STORE_NAME)) {
          const store = db.createObjectStore(ARCHIVE_STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('isAutosave', 'isAutosave', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Gets a transaction for the archive store
   */
  private async getTransaction(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.openDB();
    const transaction = db.transaction(ARCHIVE_STORE_NAME, mode);
    return transaction.objectStore(ARCHIVE_STORE_NAME);
  }

  /**
   * Retrieves all archive records
   */
  async getAll(): Promise<ArchiveRecord[]> {
    try {
      const store = await this.getTransaction('readonly');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const records = request.result as ArchiveRecord[];
          // Sort: autosave first, then by updatedAt descending
          records.sort((a, b) => {
            if (a.isAutosave) return -1;
            if (b.isAutosave) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          console.log('Archives retrieved:', records);
          resolve(records);
        };
        request.onerror = () => reject(new Error('Failed to retrieve archives'));
      });
    } catch (error) {
      console.error('Error retrieving archives:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single archive by ID
   */
  async getById(id: string): Promise<ArchiveRecord | null> {
    try {
      const store = await this.getTransaction('readonly');
      const request = store.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(new Error('Failed to retrieve archive'));
      });
    } catch (error) {
      console.error('Error retrieving archive:', error);
      throw error;
    }
  }

  /**
   * Retrieves the autosave record
   */
  async getAutosave(): Promise<ArchiveRecord | null> {
    return this.getById(AUTOSAVE_ID);
  }

  /**
   * Creates a new archive record
   */
  async create(input: CreateArchiveInput): Promise<ArchiveRecord> {
    try {
      const now = new Date().toISOString();
      const record: ArchiveRecord = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...input,
      };

      const store = await this.getTransaction('readwrite');
      const request = store.add(record);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Archive created:', record.name);
          resolve(record);
        };
        request.onerror = () => reject(new Error('Failed to create archive'));
      });
    } catch (error) {
      console.error('Error creating archive:', error);
      throw error;
    }
  }

  /**
   * Updates an existing archive record
   * Only updates updatedAt if data is being changed (overwrite action)
   */
  async update(id: string, updates: Partial<ArchiveRecord>): Promise<ArchiveRecord> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Archive not found');
      }

      // Only update updatedAt if data is being changed (overwrite action)
      const shouldUpdateTimestamp = updates.data !== undefined;

      const updated: ArchiveRecord = {
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: shouldUpdateTimestamp ? new Date().toISOString() : existing.updatedAt,
      };

      const store = await this.getTransaction('readwrite');
      const request = store.put(updated);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Archive updated:', updated.name);
          resolve(updated);
        };
        request.onerror = () => reject(new Error('Failed to update archive'));
      });
    } catch (error) {
      console.error('Error updating archive:', error);
      throw error;
    }
  }

  /**
   * Deletes an archive record (rejects if it's autosave)
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Archive not found');
      }

      if (existing.isAutosave) {
        throw new Error('Cannot delete autosave');
      }

      const store = await this.getTransaction('readwrite');
      const request = store.delete(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Archive deleted:', existing.name);
          resolve();
        };
        request.onerror = () => reject(new Error('Failed to delete archive'));
      });
    } catch (error) {
      console.error('Error deleting archive:', error);
      throw error;
    }
  }

  /**
   * Creates or updates the autosave record
   */
  async upsertAutosave(data: ArchiveData): Promise<ArchiveRecord> {
    try {
      const existing = await this.getAutosave();
      const now = new Date().toISOString();

      const record: ArchiveRecord = {
        id: AUTOSAVE_ID,
        name: 'Autosave',
        data: JSON.stringify(data),
        isAutosave: true,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      const store = await this.getTransaction('readwrite');
      const request = store.put(record);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Autosave updated');
          resolve(record);
        };
        request.onerror = () => reject(new Error('Failed to save autosave'));
      });
    } catch (error) {
      console.error('Error saving autosave:', error);
      throw error;
    }
  }
}

// Export singleton instance
const archiveApi = new IndexedDBAdapter();
export default archiveApi;
