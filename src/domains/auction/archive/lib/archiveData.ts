import type { ArchivedLot } from '@models/slot.model';
import type { Purchase } from '@reducers/Purchases/Purchases.ts';
import type { ArchiveData } from '../model/types';

interface CreateArchiveDataOptions {
  lots: ArchivedLot[];
  purchases?: Purchase[];
  isAutosave: boolean;
  includePurchases?: boolean;
}

/**
 * Builds archive payloads. Autosaves include pending purchases by default,
 * while manual saves can opt in explicitly.
 */
export const createArchiveData = ({
  lots,
  purchases = [],
  isAutosave,
  includePurchases = isAutosave,
}: CreateArchiveDataOptions): ArchiveData => {
  if (!includePurchases || purchases.length === 0) {
    return { lots };
  }

  return {
    lots,
    purchases,
  };
};

export const getArchivePurchases = (data: ArchiveData): Purchase[] => data.purchases ?? [];

export const checkHasArchiveContent = (data: ArchiveData): boolean =>
  data.lots.length > 0 || getArchivePurchases(data).length > 0;
