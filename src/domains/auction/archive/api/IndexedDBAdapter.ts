import Dexie, { type EntityTable } from 'dexie';

import { ArchiveData, ArchiveRecord, CreateArchiveInput } from '../model/types';
import { ARCHIVE_DB_NAME, AUTOSAVE_ID } from '../model/constants';

import ArchiveApi from './ArchiveApi';

/**
 * Dexie database instance for archive management
 */
class ArchiveDatabase extends Dexie {
  archives!: EntityTable<ArchiveRecord, 'id'>;

  constructor() {
    super(ARCHIVE_DB_NAME);
    this.version(1).stores({
      archives: 'id, name, createdAt, isAutosave',
    });
  }
}

class IndexedDBAdapter extends ArchiveApi {
  private db: ArchiveDatabase;

  constructor() {
    super();
    this.db = new ArchiveDatabase();
  }

  /**
   * Retrieves all archive records
   */
  async getAll(): Promise<ArchiveRecord[]> {
    const records = await this.db.archives.toArray();

    // Sort: autosave first, then by updatedAt descending
    records.sort((a, b) => {
      if (a.isAutosave) return -1;
      if (b.isAutosave) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return records;
  }

  /**
   * Retrieves a single archive by ID
   */
  async getById(id: string): Promise<ArchiveRecord | null> {
    const result = await this.db.archives.get(id);
    return result || null;
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
    const now = new Date().toISOString();
    const record: ArchiveRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    await this.db.archives.add(record);
    return record;
  }

  /**
   * Updates an existing archive record
   * Only updates updatedAt if data is being changed (overwrite action)
   */
  async update(id: string, updates: Partial<ArchiveRecord>): Promise<ArchiveRecord> {
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

    await this.db.archives.put(updated);
    return updated;
  }

  /**
   * Deletes an archive record (rejects if it's autosave)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Archive not found');
    }

    if (existing.isAutosave) {
      throw new Error('Cannot delete autosave');
    }

    await this.db.archives.delete(id);
  }

  /**
   * Creates or updates the autosave record
   */
  async upsertAutosave(data: ArchiveData): Promise<ArchiveRecord> {
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

    await this.db.archives.put(record);
    return record;
  }
}

// Export singleton instance
const archiveApi = new IndexedDBAdapter();
export default archiveApi;
