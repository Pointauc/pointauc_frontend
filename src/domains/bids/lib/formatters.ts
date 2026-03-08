import { numberUtils } from '@utils/common/number';

export const getDisplayCost = (cost: number): number => {
  return numberUtils.roundFixed(cost, 2);
};
