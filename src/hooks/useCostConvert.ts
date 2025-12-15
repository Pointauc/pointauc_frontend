import { useSelector } from 'react-redux';
import { useCallback } from 'react';

import { RootState } from '@reducers';
import bidUtils from '@utils/bid.utils.ts';

interface UseCostConvertResult {
  getMarblesAmount: (cost: number, newSlot?: boolean) => number;
  formatMarblesCost: (cost: number) => string | number;
}

export const useCostConvert = (): UseCostConvertResult => {
  const marblesAuc = useSelector((root: RootState) => root.aucSettings.settings.marblesAuc);
  const marbleCategory = useSelector((root: RootState) => root.aucSettings.settings.marbleCategory);
  const marbleRate = useSelector((root: RootState) => root.aucSettings.settings.marbleRate);

  const convertToMarble = useCallback(
    (cost: number, newSlot: boolean): number =>
      bidUtils.convertToMarble({ cost, newLot: newSlot, marbleCategory, marbleRate }),
    [marbleCategory, marbleRate],
  );

  const getMarblesAmount = useCallback(
    (cost: number, newSlot = false): number => (marblesAuc ? convertToMarble(cost, newSlot) : cost),
    [convertToMarble, marblesAuc],
  );

  const formatMarblesCost = useCallback(
    (cost: number): string | number => {
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
