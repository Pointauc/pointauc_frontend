import { CreateRuleInput, RuleRecord } from '../model/types';
import { RULES_DB_NAME, RULES_STORE_NAME } from '../model/constants';

import RulesApi from './RulesApi';

class IndexedDBAdapter extends RulesApi {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Wraps an IDBRequest in a Promise
   */
  private requestToPromise<T>(request: IDBRequest<T>, errorMessage: string, transform?: (result: T) => T): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = transform ? transform(request.result) : request.result;
        resolve(result);
      };
      request.onerror = () => reject(new Error(errorMessage));
    });
  }

  /**
   * Opens or creates the IndexedDB database
   */
  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(RULES_DB_NAME, 1);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create rules store
        if (!db.objectStoreNames.contains(RULES_STORE_NAME)) {
          const store = db.createObjectStore(RULES_STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Gets a transaction for the rules store
   */
  private async getTransaction(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.openDB();
    const transaction = db.transaction(RULES_STORE_NAME, mode);
    return transaction.objectStore(RULES_STORE_NAME);
  }

  /**
   * Retrieves all rule records
   */
  async getAll(): Promise<RuleRecord[]> {
    try {
      const store = await this.getTransaction('readonly');
      const request = store.getAll();

      return this.requestToPromise(request, 'Failed to retrieve rules');
    } catch (error) {
      console.error('Error retrieving rules:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single rule by ID
   */
  async getById(id: string): Promise<RuleRecord | null> {
    try {
      const store = await this.getTransaction('readonly');
      const request = store.get(id);

      return this.requestToPromise(request, 'Failed to retrieve rule', (result) => result || null);
    } catch (error) {
      console.error('Error retrieving rule:', error);
      throw error;
    }
  }

  /**
   * Creates a new rule record
   */
  async create(input: CreateRuleInput): Promise<RuleRecord> {
    try {
      const now = new Date().toISOString();
      const record: RuleRecord = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...input,
      };

      const store = await this.getTransaction('readwrite');
      const request = store.add(record);

      await this.requestToPromise(request, 'Failed to create rule');
      return record;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }

  /**
   * Updates an existing rule record
   */
  async update(id: string, updates: Partial<RuleRecord>): Promise<RuleRecord> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Rule not found');
      }

      const updated: RuleRecord = {
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const store = await this.getTransaction('readwrite');
      const request = store.put(updated);

      await this.requestToPromise(request, 'Failed to update rule');
      return updated;
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  /**
   * Deletes a rule record
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Rule not found');
      }

      const store = await this.getTransaction('readwrite');
      const request = store.delete(id);

      return this.requestToPromise(request, 'Failed to delete rule');
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }
}

// Export singleton instance
const rulesActiveApi = new IndexedDBAdapter();
export default rulesActiveApi;
