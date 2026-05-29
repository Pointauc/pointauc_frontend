export interface LotContributor {
  name: string;
  amount: number;
}

export interface Lot {
  fastId: number;
  id: string;
  name: string | null;
  amount: number | null;
  extra: number | null;
  contributors?: LotContributor[];
  lockedPercentage?: number | null;
  isFavorite?: boolean;
}

export type SlotResponse = Omit<Lot, 'extra'>;

export type ArchivedLot = Omit<Lot, 'extra' | 'id' | 'fastId'>;
