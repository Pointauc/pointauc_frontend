import { ArchivedLot } from '@models/slot.model';

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
}

export type CreateArchiveInput = Omit<ArchiveRecord, 'id' | 'createdAt' | 'updatedAt'>;

