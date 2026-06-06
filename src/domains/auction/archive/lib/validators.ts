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
    typeof record.isAutosave === 'boolean' &&
    (record.isLastDeleted === undefined || typeof record.isLastDeleted === 'boolean')
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
    if (data.purchases !== undefined && !Array.isArray(data.purchases)) return false;

    const checkLots = data.lots.every((lot) => {
      if (!lot || typeof lot !== 'object') {
        return false;
      }

      const archiveLot = lot as Record<string, unknown>;

      return (
        (archiveLot.name === null || typeof archiveLot.name === 'string') &&
        (archiveLot.amount === null || typeof archiveLot.amount === 'number') &&
        (archiveLot.contributors === undefined || Array.isArray(archiveLot.contributors)) &&
        (archiveLot.investors === undefined || Array.isArray(archiveLot.investors))
      );
    });

    if (!checkLots) {
      return false;
    }

    return true;
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
