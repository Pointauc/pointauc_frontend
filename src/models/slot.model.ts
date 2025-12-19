export interface Slot {
  fastId: number;
  id: string;
  name: string | null;
  amount: number | null;
  extra: number | null;
  investors?: string[];
  lockedPercentage?: number | null;
}

export type SlotResponse = Omit<Slot, 'extra'>;

export type ArchivedLot = Omit<Slot, 'extra' | 'id' | 'fastId'>;
