import { ArchivedLot, Slot } from '@models/slot.model';
import { createSlot } from '@reducers/Slots/Slots';

/**
 * Converts Slot array to ArchivedLot array by omitting runtime-only properties
 */
export function slotsToArchivedLots(slots: Slot[]): ArchivedLot[] {
  return slots.map((slot) => ({
    name: slot.name,
    amount: slot.amount,
    investors: slot.investors,
    isFavorite: slot.isFavorite
  }));
}

/**
 * Converts ArchivedLot array to Slot array by creating new Slot instances
 */
export function archivedLotsToSlots(lots: ArchivedLot[]): Slot[] {
  return lots.map((lot) =>
    createSlot({
      name: lot.name,
      amount: lot.amount,
      investors: lot.investors,
      isFavorite: lot.isFavorite
    }),
  );
}

