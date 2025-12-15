import { ArchiveData, ArchiveRecord } from '../model/types';

/**
 * Validates that an object is a valid ArchiveRecord
 */
export function isValidArchiveRecord(obj: unknown): obj is ArchiveRecord {
  if (!obj || typeof obj !== 'object') return false;

  const record = obj as Partial<ArchiveRecord>;

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string' &&
    typeof record.data === 'string' &&
    typeof record.isAutosave === 'boolean'
  );
}

/**
 * Validates that a string contains valid ArchiveData JSON
 */
export function isValidArchiveData(dataString: string): boolean {
  try {
    const data = JSON.parse(dataString) as Partial<ArchiveData>;

    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.lots)) return false;

    return data.lots.every(
      (lot) =>
        lot &&
        typeof lot === 'object' &&
        (lot.name === null || typeof lot.name === 'string') &&
        (lot.amount === null || typeof lot.amount === 'number') &&
        (lot.investors === undefined || Array.isArray(lot.investors)),
    );
  } catch {
    return false;
  }
}

/**
 * Validates archive name
 */
export function isValidArchiveName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 100;
}

