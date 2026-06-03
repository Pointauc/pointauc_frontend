import { Lot } from '../models/slot.model';

export const percentsRefMap = new Map<string, HTMLSpanElement>();

export const getValidAmount = (amount: number | null): number => (amount && amount > 0 ? amount : 0);

let lastTotalSum = 0;

export const calculateLotPercentage = (amount: Lot['amount'], total: number): number => {
  return (getValidAmount(amount) / total) * 100;
};

export const updatePercents = (slots: Lot[], chanceRefMap = percentsRefMap, cached?: boolean): void => {
  if (!cached) {
    lastTotalSum = slots.reduce((accum, { amount }) => accum + getValidAmount(amount), 0) || 1;
  }

  slots.forEach(({ id, amount }) => {
    const ref = chanceRefMap.get(id);

    if (ref) {
      ref.textContent = `${calculateLotPercentage(amount, lastTotalSum).toFixed(1) || 0}%`;
    }
  });
};
