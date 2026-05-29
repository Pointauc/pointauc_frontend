import { Lot } from '@models/slot.model';

export const getSlotNameById = (slots: Lot[]): Map<string, string | null> => {
  const slotNameById = new Map<string, string | null>();
  slots.forEach(({ id, name }) => {
    slotNameById.set(id, name);
  });

  return slotNameById;
};
