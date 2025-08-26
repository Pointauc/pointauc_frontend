import { LocalState, ILocalStateOptions, IFindOptions, IUpdateOptions, IDeleteOptions } from './LocalState';

export class IndexedDBLocalState<T extends Record<string, any>> extends LocalState<T> {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(options: ILocalStateOptions & { dbName?: string; dbVersion?: number }) {
    super(options);
    this.dbName = options.dbName || 'LocalStateDB';
    this.dbVersion = options.dbVersion || 1;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.tableName)) {
          const store = db.createObjectStore(this.tableName, {
            keyPath: this.primaryKey,
            autoIncrement: false,
          });

          // Create indexes
          this.indexes.forEach((indexName) => {
            if (!store.indexNames.contains(indexName)) {
              store.createIndex(indexName, indexName, { unique: false });
            }
          });
        }
      };
    });
  }

  private getTransaction(mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db.transaction([this.tableName], mode);
  }

  private getObjectStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    return this.getTransaction(mode).objectStore(this.tableName);
  }

  async save(data: Partial<T> & Record<string, any>): Promise<T> {
    const record = { ...data } as any;

    console.log('save', data);

    // Generate ID if not provided
    if (!record[this.primaryKey]) {
      record[this.primaryKey] = this.generateId();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);
      const request = store.put(record);

      request.onsuccess = () => resolve(record as T);
      request.onerror = () => reject(new Error('Failed to save record'));
    });
  }

  async saveMany(data: (Partial<T> & Record<string, any>)[]): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);

      let completed = 0;

      data.forEach((item) => {
        const record = { ...item } as any;
        if (!record[this.primaryKey]) {
          record[this.primaryKey] = this.generateId();
        }

        const request = store.put(record);

        request.onsuccess = () => {
          results.push(record as T);
          completed++;
          if (completed === data.length) {
            resolve(results);
          }
        };

        request.onerror = () => reject(new Error('Failed to save records'));
      });

      if (data.length === 0) {
        resolve([]);
      }
    });
  }

  async findById(id: string | number): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to find record'));
    });
  }

  async findOne(options: IFindOptions = {}): Promise<T | null> {
    const results = await this.find({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async find(options: IFindOptions = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.getAll();

      request.onsuccess = () => {
        let results: T[] = request.result || [];

        // Apply where conditions
        if (options.where) {
          results = results.filter((record) => this.matchesCriteria(record, options.where!));
        }

        // Apply sorting
        if (options.orderBy) {
          results = this.sortRecords(results, options.orderBy);
        }

        // Apply pagination
        results = this.paginateRecords(results, options.limit, options.offset);

        resolve(results);
      };
      request.onerror = () => reject(new Error('Failed to find records'));
    });
  }

  async findAll(): Promise<T[]> {
    return this.find();
  }

  async update(data: Partial<T> & Record<string, any>, options: IUpdateOptions = {}): Promise<number> {
    const records = await this.find({ where: options.where });
    let updated = 0;

    return new Promise((resolve, reject) => {
      if (records.length === 0) {
        resolve(0);
        return;
      }

      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);

      let completed = 0;

      records.forEach((record) => {
        const updatedRecord = { ...record, ...data };
        const request = store.put(updatedRecord);

        request.onsuccess = () => {
          updated++;
          completed++;
          if (completed === records.length) {
            resolve(updated);
          }
        };

        request.onerror = () => reject(new Error('Failed to update records'));
      });
    });
  }

  async updateById(id: string | number, data: Partial<T> & Record<string, any>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    await this.save(updated);
    return updated;
  }

  async delete(options: IDeleteOptions = {}): Promise<number> {
    const records = await this.find({ where: options.where });
    let deleted = 0;

    return new Promise((resolve, reject) => {
      if (records.length === 0) {
        resolve(0);
        return;
      }

      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);

      let completed = 0;

      records.forEach((record) => {
        const request = store.delete(record[this.primaryKey]);

        request.onsuccess = () => {
          deleted++;
          completed++;
          if (completed === records.length) {
            resolve(deleted);
          }
        };

        request.onerror = () => reject(new Error('Failed to delete records'));
      });
    });
  }

  async deleteById(id: string | number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to delete record'));
    });
  }

  async count(options: IFindOptions = {}): Promise<number> {
    if (!options.where) {
      // If no where clause, use the native count method
      return new Promise((resolve, reject) => {
        const store = this.getObjectStore('readonly');
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to count records'));
      });
    }

    // If there's a where clause, we need to get all records and filter
    const records = await this.find(options);
    return records.length;
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite');
      const store = transaction.objectStore(this.tableName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear records'));
    });
  }

  async exists(id: string | number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.count(id);

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(new Error('Failed to check if record exists'));
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Delete the entire database
   */
  static async deleteDatabase(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(new Error('Failed to delete database'));
    });
  }
}
