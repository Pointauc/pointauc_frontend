import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../reducers';

export const useCostConvert = (): ((cost: number, newSlot?: boolean) => number) => {
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

  return useCallback((cost: number, newSlot = false): number => (marblesAuc ? convertToMarble(cost, newSlot) : cost), [
    convertToMarble,
    marblesAuc,
  ]);
};
