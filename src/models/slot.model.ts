export interface Slot {
  fastId: number;
  id: string;
  name: string | null;
  amount: number | null;
  extra: number | null;
}

export type SlotsList = [Slot[], Slot[]];

export interface SlotPosition {
  arrayIndex: number;
  listIndex: number;
}
