import type { ArchivedLot } from '@models/slot.model';
import type { ActionLogEntry } from '@reducers/ActionsLog/ActionsLog.ts';
import type { Purchase } from '@reducers/Purchases/Purchases.ts';
import type { ArchiveData } from '../model/types';

interface CreateArchiveDataOptions {
  lots: ArchivedLot[];
  purchases?: Purchase[];
  /** Kept for compatibility with older callers; new archives do not persist action logs. */
  actionLog?: ActionLogEntry[];
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
  const data: ArchiveData = { lots };

  if (includePurchases && purchases.length > 0) {
    data.purchases = purchases;
  }

  return data;
};

export const getArchivePurchases = (data: ArchiveData): Purchase[] => data.purchases ?? [];

export const getArchiveActionLog = (data: ArchiveData): ActionLogEntry[] => data.actionLog ?? [];

export const checkHasArchiveContent = (data: ArchiveData): boolean =>
  data.lots.length > 0 || getArchivePurchases(data).length > 0;
