import { ArchiveData, ArchiveRecord, CreateArchiveInput } from '../model/types';

/**
 * Abstract base class for archive operations.
 * Implementations can use IndexedDB, backend API, or any other storage mechanism.
 */
abstract class ArchiveApi {
  abstract getAll(): Promise<ArchiveRecord[]>;
  abstract getById(id: string): Promise<ArchiveRecord | null>;
  abstract getAutosave(): Promise<ArchiveRecord | null>;
  abstract create(record: CreateArchiveInput): Promise<ArchiveRecord>;
  abstract update(id: string, updates: Partial<ArchiveRecord>): Promise<ArchiveRecord>;
  abstract delete(id: string): Promise<void>;
  abstract upsertAutosave(data: ArchiveData): Promise<ArchiveRecord>;
}

export default ArchiveApi;

