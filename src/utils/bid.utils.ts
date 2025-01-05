import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { Settings } from '@models/settings.model.ts';
import { numberUtils } from '@utils/common/number.ts';

import { store } from '../main.tsx';

type CostSettings = Pick<Settings, 'marblesAuc' | 'marbleRate' | 'pointsRate' | 'marbleCategory' | 'reversePointsRate'>;

interface MarbleConversionProps {
  cost: number;
  newLot: boolean;
  marbleCategory: number;
  marbleRate: number;
}
const convertToMarble = ({ cost, newLot, marbleCategory, marbleRate }: MarbleConversionProps): number => {
  const minValue = newLot ? marbleCategory : marbleRate;

  if (cost < minValue) {
    return 0;
  }
  const total = cost - minValue;

  return Math.floor(total / marbleRate) + 1;
};

const parseCost = (bid: Purchase, settings: CostSettings, newLot: boolean): number => {
  const { marblesAuc, marbleRate, reversePointsRate, marbleCategory, pointsRate } = settings;
  const { cost, isDonation } = bid;

  let convertedCost = cost;
  if (reversePointsRate && !isDonation) {
    convertedCost = numberUtils.roundFixed(cost / pointsRate, 2);
  } else if (isDonation && !reversePointsRate) {
    convertedCost = cost * pointsRate;
  }

  return marblesAuc ? convertToMarble({ cost: convertedCost, newLot, marbleCategory, marbleRate }) : convertedCost;
};

const getDisplayCost = (cost: number): number | string => {
  const hideAmounts = store.getState().aucSettings.settings.hideAmounts;

  return hideAmounts ? '**' : cost;
};

const bidUtils = {
  parseCost,
  getDisplayCost,
  convertToMarble,
};

export default bidUtils;
