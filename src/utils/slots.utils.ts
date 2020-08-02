import { Slot } from '../models/slot.model';

// eslint-disable-next-line import/prefer-default-export
export const getWinnerSlot = (slots: Slot[]): Slot =>
  slots.reduce((winnerSlot, slot) =>
    Number(winnerSlot.amount) > Number(slot.amount) ? winnerSlot : slot,
  );
