import { LocalState, ILocalStateOptions, IFindOptions, IUpdateOptions, IDeleteOptions } from './LocalState';

export class LocalStorageLocalState<T extends Record<string, any>> extends LocalState<T> {
  private storageKey: string;

  constructor(options: ILocalStateOptions & { storagePrefix?: string }) {
    super(options);
    const prefix = options.storagePrefix || 'LocalState';
    this.storageKey = `${prefix}_${this.tableName}`;
  }

  async init(): Promise<void> {
    // Ensure the storage key exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  private getAllRecords(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return [];
    }
  }

  private setAllRecords(records: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('localStorage quota exceeded. Consider using IndexedDB for larger datasets.');
      }
      throw new Error('Failed to save to localStorage');
    }
  }

  async save(data: Partial<T> & Record<string, any>): Promise<T> {
    const records = this.getAllRecords();
    const record = { ...data } as any;

    // Generate ID if not provided
    if (!record[this.primaryKey]) {
      record[this.primaryKey] = this.generateId();
    }

    // Check if record already exists and update it, otherwise add new
    const existingIndex = records.findIndex((r) => (r as any)[this.primaryKey] === record[this.primaryKey]);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    this.setAllRecords(records);
    return record;
  }

  async saveMany(data: (Partial<T> & Record<string, any>)[]): Promise<T[]> {
    const records = this.getAllRecords();
    const newRecords: T[] = [];

    data.forEach((item) => {
      const record = { ...item } as any;

      // Generate ID if not provided
      if (!record[this.primaryKey]) {
        record[this.primaryKey] = this.generateId();
      }

      // Check if record already exists and update it, otherwise add new
      const existingIndex = records.findIndex((r) => (r as any)[this.primaryKey] === record[this.primaryKey]);

      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }

      newRecords.push(record);
    });

    this.setAllRecords(records);
    return newRecords;
  }

  async findById(id: string | number): Promise<T | null> {
    const records = this.getAllRecords();
    return records.find((record) => (record as any)[this.primaryKey] === id) || null;
  }

  async findOne(options: IFindOptions = {}): Promise<T | null> {
    const results = await this.find({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async find(options: IFindOptions = {}): Promise<T[]> {
    let records = this.getAllRecords();

    // Apply where conditions
    if (options.where) {
      records = records.filter((record) => this.matchesCriteria(record, options.where!));
    }

    // Apply sorting
    if (options.orderBy) {
      records = this.sortRecords(records, options.orderBy);
    }

    // Apply pagination
    records = this.paginateRecords(records, options.limit, options.offset);

    return records;
  }

  async findAll(): Promise<T[]> {
    return this.getAllRecords();
  }

  async update(data: Partial<T> & Record<string, any>, options: IUpdateOptions = {}): Promise<number> {
    const records = this.getAllRecords();
    let updated = 0;

    const updatedRecords = records.map((record) => {
      if (!options.where || this.matchesCriteria(record, options.where)) {
        updated++;
        return { ...record, ...data };
      }
      return record;
    });

    if (updated > 0) {
      this.setAllRecords(updatedRecords);
    }

    return updated;
  }

  async updateById(id: string | number, data: Partial<T> & Record<string, any>): Promise<T | null> {
    const records = this.getAllRecords();
    const index = records.findIndex((record) => (record as any)[this.primaryKey] === id);

    if (index === -1) {
      return null;
    }

    const updatedRecord = { ...records[index], ...data };
    records[index] = updatedRecord;
    this.setAllRecords(records);

    return updatedRecord;
  }

  async delete(options: IDeleteOptions = {}): Promise<number> {
    const records = this.getAllRecords();
    const initialLength = records.length;

    const remainingRecords = records.filter((record) => {
      if (!options.where) {
        return false; // Delete all if no where clause
      }
      return !this.matchesCriteria(record, options.where);
    });

    const deletedCount = initialLength - remainingRecords.length;

    if (deletedCount > 0) {
      this.setAllRecords(remainingRecords);
    }

    return deletedCount;
  }

  async deleteById(id: string | number): Promise<boolean> {
    const records = this.getAllRecords();
    const initialLength = records.length;
    const filteredRecords = records.filter((record) => (record as any)[this.primaryKey] !== id);

    if (filteredRecords.length < initialLength) {
      this.setAllRecords(filteredRecords);
      return true;
    }

    return false;
  }

  async count(options: IFindOptions = {}): Promise<number> {
    let records = this.getAllRecords();

    // Apply where conditions
    if (options.where) {
      records = records.filter((record) => this.matchesCriteria(record, options.where!));
    }

    return records.length;
  }

  async clear(): Promise<void> {
    this.setAllRecords([]);
  }

  async exists(id: string | number): Promise<boolean> {
    const records = this.getAllRecords();
    return records.some((record) => (record as any)[this.primaryKey] === id);
  }

  /**
   * Get the current size of the stored data in bytes
   */
  getStorageSize(): number {
    const data = localStorage.getItem(this.storageKey) || '';
    return new Blob([data]).size;
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    recordCount: number;
    sizeInBytes: number;
    sizeInKB: number;
    sizeInMB: number;
  } {
    const records = this.getAllRecords();
    const sizeInBytes = this.getStorageSize();

    return {
      recordCount: records.length,
      sizeInBytes,
      sizeInKB: Math.round((sizeInBytes / 1024) * 100) / 100,
      sizeInMB: Math.round((sizeInBytes / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * Export all data as JSON string
   */
  exportData(): string {
    return localStorage.getItem(this.storageKey) || '[]';
  }

  /**
   * Import data from JSON string
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const records = JSON.parse(jsonData);
      if (!Array.isArray(records)) {
        throw new Error('Import data must be an array');
      }
      this.setAllRecords(records);
    } catch (error) {
      throw new Error('Failed to import data: Invalid JSON format');
    }
  }

  /**
   * Remove the storage key entirely
   */
  async destroy(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available localStorage space (approximate)
   */
  static getAvailableSpace(): number {
    try {
      let i = 0;
      const testKey = '__test_space__';
      const testValue = 'a'.repeat(1024); // 1KB chunks

      while (i < 10000) {
        // Add reasonable upper limit
        try {
          localStorage.setItem(testKey + i, testValue);
          i++;
        } catch {
          break;
        }
      }

      // Clean up test data
      for (let j = 0; j < i; j++) {
        localStorage.removeItem(testKey + j);
      }

      return i * 1024; // Return in bytes
    } catch {
      return 0;
    }
  }
}
