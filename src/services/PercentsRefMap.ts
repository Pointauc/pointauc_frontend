import { Slot } from '../models/slot.model';

export const percentsRefMap = new Map<string, HTMLSpanElement>();

const getValidAmount = (amount: number | null): number => (amount && amount > 0 ? amount : 0);

export const updatePercents = (slots: Slot[], chanceRefMap = percentsRefMap): void => {
  const totalSum = slots.reduce((accum, { amount }) => accum + getValidAmount(amount), 0) || 1;

  slots.forEach(({ id, amount }) => {
    const ref = chanceRefMap.get(id);

    if (ref) {
      ref.innerHTML = `${((getValidAmount(amount) / totalSum) * 100).toFixed(1) || 0}%`;
    }
  });
};
