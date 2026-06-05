import { ArchivedLot } from '@models/slot.model';

import type { Purchase } from '@reducers/Purchases/Purchases.ts';
import type { ActionLogEntry } from '@reducers/ActionsLog/ActionsLog.ts';

export interface ArchiveRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: string;
  isAutosave: boolean;
}

export interface ArchiveData {
  lots: ArchivedLot[];
  purchases?: Purchase[];
  actionLog?: ActionLogEntry[];
}

export type CreateArchiveInput = Omit<ArchiveRecord, 'id' | 'createdAt' | 'updatedAt'>;
