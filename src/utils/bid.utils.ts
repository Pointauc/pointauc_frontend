import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { Settings } from '@models/settings.model.ts';
import { numberUtils } from '@utils/common/number.ts';
import { BidNameStrategy } from '@enums/bid.enum.ts';

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

// ToDo: Implement as a class propeerty
const getName = (bid: Purchase): string => {
  const { bidNameStrategy } = store.getState().aucSettings.settings;
  const { message, username } = bid;

  switch (bidNameStrategy) {
    case BidNameStrategy.Username:
      return username || 'Anonymous';
    case BidNameStrategy.Message:
    default:
      return message || '';
  }
};

const bidUtils = {
  parseCost,
  getDisplayCost,
  convertToMarble,
  getName,
};

export default bidUtils;
