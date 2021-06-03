import { Slot } from '../models/slot.model';
import { REMOVE_COST_PREFIX } from '../constants/purchase.constants';
import { Purchase } from '../reducers/Purchases/Purchases';

export const getWinnerSlot = (slots: Slot[]): Slot =>
  slots.reduce((winnerSlot, slot) => (Number(winnerSlot.amount) > Number(slot.amount) ? winnerSlot : slot));

export const normalizePurchase = ({ message, cost, ...restPurchase }: Purchase): Purchase => ({
  message: message.startsWith(REMOVE_COST_PREFIX) ? message.slice(1) : message,
  cost: message.startsWith(REMOVE_COST_PREFIX) ? -cost : cost,
  ...restPurchase,
});

export const parseSlotsPreset = (text: string): Slot[] => {
  return text
    .split('\n')
    .map<Slot>((value, id) => ({ fastId: id, id: id.toString(), name: value, amount: 1, extra: null }));
};

export const getTotalSize = (slots: Slot[]): number => slots.reduce((accum, { amount }) => accum + Number(amount), 0);

export const getSlot = (slots: Slot[], slotId: string): Slot | undefined => slots.find(({ id }) => id === slotId);
