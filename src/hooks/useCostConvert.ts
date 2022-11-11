import { useSelector } from 'react-redux';
import { ReactText, useCallback } from 'react';
import { RootState } from '../reducers';

interface UseCostConvertResult {
  getMarblesAmount: (cost: number, newSlot?: boolean) => number;
  formatMarblesCost: (cost: number) => ReactText;
}

export const useCostConvert = (): UseCostConvertResult => {
  const {
    settings: { marblesAuc, marbleCategory = 1, marbleRate = 1 },
  } = useSelector((root: RootState) => root.aucSettings);

  const convertToMarble = useCallback(
    (cost: number, newSlot: boolean): number => {
      const minValue = newSlot ? marbleCategory : marbleRate;

      if (cost < minValue) {
        return 0;
      }
      const total = cost - minValue;

      return Math.floor(total / marbleRate) + 1;
    },
    [marbleCategory, marbleRate],
  );

  const getMarblesAmount = useCallback(
    (cost: number, newSlot = false): number => (marblesAuc ? convertToMarble(cost, newSlot) : cost),
    [convertToMarble, marblesAuc],
  );

  const formatMarblesCost = useCallback(
    (cost: number): ReactText => {
      if (!marblesAuc) {
        return cost;
      }

      const newSlotCost = convertToMarble(cost, true);
      const addToSlotCost = convertToMarble(cost, false);

      return newSlotCost === addToSlotCost ? newSlotCost : `${newSlotCost}|${addToSlotCost}`;
    },
    [convertToMarble, marblesAuc],
  );

  return {
    getMarblesAmount,
    formatMarblesCost,
  };
};
