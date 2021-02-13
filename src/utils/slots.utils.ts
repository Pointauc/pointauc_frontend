import { Slot, SlotPosition, SlotsList } from '../models/slot.model';
import { REMOVE_COST_PREFIX } from '../constants/purchase.constants';
import { Bid } from '../reducers/Purchases/Purchases';
import { sortSlots } from './common.utils';

export const getWinnerSlot = (slots: Slot[]): Slot =>
  slots.reduce((winnerSlot, slot) => (Number(winnerSlot.amount) > Number(slot.amount) ? winnerSlot : slot));

export const normalizePurchase = ({ message, cost, ...restPurchase }: Bid): Bid => ({
  message: message.startsWith(REMOVE_COST_PREFIX) ? message.slice(1) : message,
  cost: message.startsWith(REMOVE_COST_PREFIX) ? -cost : cost,
  ...restPurchase,
});

export const getSlotPosition = (slotsList: SlotsList, id: string): SlotPosition => {
  let arrayIndex = -1;
  const findSlot = (slots: Slot[]): boolean => {
    arrayIndex = slots.findIndex((slot) => slot.id === id);

    return arrayIndex > -1;
  };
  const listIndex = slotsList.findIndex(findSlot);

  return { arrayIndex, listIndex };
};

export const getAmountSum = (slot: Slot): number | null =>
  slot.extra ? Number(slot.amount) + slot.extra : slot.amount;
export const updateSlotPosition = (slots: Slot[], index: number): void => {
  if (Number(slots[index].amount) >= Number(slots[0].amount)) {
    slots.unshift(slots.splice(index, 1)[0]);
  }
};

export const updateSlot = (
  slots: SlotsList,
  updatedId: string,
  transform: (slot: Slot) => Slot,
  updatePosition = false,
): void => {
  const { arrayIndex, listIndex } = getSlotPosition(slots, updatedId);

  slots[listIndex][arrayIndex] = transform(slots[listIndex][arrayIndex]);

  if (updatePosition) {
    updateSlotPosition(slots[listIndex], arrayIndex);
    sortSlots(slots[listIndex]);
  }
};
