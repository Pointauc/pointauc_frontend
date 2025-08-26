export interface ILocalStateOptions {
  tableName: string;
  primaryKey?: string;
  indexes?: string[];
}

export interface IFindOptions {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface IUpdateOptions {
  where?: Record<string, any>;
}

export interface IDeleteOptions {
  where?: Record<string, any>;
}

export abstract class LocalState<T extends Record<string, any> = Record<string, any>> {
  protected tableName: string;
  protected primaryKey: string;
  protected indexes: string[];

  constructor(options: ILocalStateOptions) {
    this.tableName = options.tableName;
    this.primaryKey = options.primaryKey || 'id';
    this.indexes = options.indexes || [];
  }

  /**
   * Initialize the storage (create table/setup if needed)
   */
  abstract init(): Promise<void>;

  /**
   * Save a single record
   */
  abstract save(data: Partial<T> & Record<string, any>): Promise<T>;

  /**
   * Save multiple records
   */
  abstract saveMany(data: (Partial<T> & Record<string, any>)[]): Promise<T[]>;

  /**
   * Find a single record by primary key
   */
  abstract findById(id: string | number): Promise<T | null>;

  /**
   * Find a single record by criteria
   */
  abstract findOne(options?: IFindOptions): Promise<T | null>;

  /**
   * Find multiple records
   */
  abstract find(options?: IFindOptions): Promise<T[]>;

  /**
   * Find all records
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Update records
   */
  abstract update(data: Partial<T> & Record<string, any>, options?: IUpdateOptions): Promise<number>;

  /**
   * Update a record by primary key
   */
  abstract updateById(id: string | number, data: Partial<T> & Record<string, any>): Promise<T | null>;

  /**
   * Delete records
   */
  abstract delete(options?: IDeleteOptions): Promise<number>;

  /**
   * Delete a record by primary key
   */
  abstract deleteById(id: string | number): Promise<boolean>;

  /**
   * Count records
   */
  abstract count(options?: IFindOptions): Promise<number>;

  /**
   * Clear all records from the table
   */
  abstract clear(): Promise<void>;

  /**
   * Check if a record exists
   */
  abstract exists(id: string | number): Promise<boolean>;

  /**
   * Generate a unique ID for new records
   */
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Helper method to match records against criteria
   */
  protected matchesCriteria(record: T, criteria: Record<string, any>): boolean {
    return Object.entries(criteria).every(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle special operators like $gt, $lt, etc.
        if ('$gt' in value) return record[key] > value.$gt;
        if ('$lt' in value) return record[key] < value.$lt;
        if ('$gte' in value) return record[key] >= value.$gte;
        if ('$lte' in value) return record[key] <= value.$lte;
        if ('$ne' in value) return record[key] !== value.$ne;
        if ('$in' in value) return value.$in.includes(record[key]);
        if ('$nin' in value) return !value.$nin.includes(record[key]);
        // Default object comparison
        return JSON.stringify(record[key]) === JSON.stringify(value);
      }
      return record[key] === value;
    });
  }

  /**
   * Helper method to sort records
   */
  protected sortRecords(records: T[], orderBy?: { field: string; direction: 'asc' | 'desc' }): T[] {
    if (!orderBy) return records;

    return [...records].sort((a, b) => {
      const aVal = a[orderBy.field];
      const bVal = b[orderBy.field];

      if (aVal < bVal) return orderBy.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return orderBy.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Helper method to apply limit and offset
   */
  protected paginateRecords(records: T[], limit?: number, offset?: number): T[] {
    let result = records;

    if (offset) {
      result = result.slice(offset);
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }
}
