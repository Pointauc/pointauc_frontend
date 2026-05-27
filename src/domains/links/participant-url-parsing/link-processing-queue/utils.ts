import { Slot } from '@models/slot.model';

export const getSlotNameById = (slots: Slot[]): Map<string, string | null> => {
  const slotNameById = new Map<string, string | null>();
  slots.forEach(({ id, name }) => {
    slotNameById.set(id, name);
  });

  return slotNameById;
};
