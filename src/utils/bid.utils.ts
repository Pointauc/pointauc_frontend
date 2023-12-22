import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { Settings } from '@models/settings.model.ts';

import { store } from '../main.tsx';

type CostSettings = Pick<Settings, 'marblesAuc' | 'marbleRate' | 'pointsRate' | 'marbleCategory'>;

const parseCost = (bid: Purchase, settings: CostSettings, newLot: boolean): number => {
  const { marblesAuc, marbleRate, marbleCategory, pointsRate } = settings;
  const convertToMarble = (cost: number): number => {
    const minValue = newLot ? marbleCategory : marbleRate;

    if (cost < minValue) {
      return 0;
    }
    const total = cost - minValue;

    return Math.floor(total / marbleRate) + 1;
  };
  const convertCost = (cost: number): number => (marblesAuc ? convertToMarble(cost) : cost);

  return convertCost(bid.isDonation ? bid.cost * pointsRate : bid.cost);
};

const getDisplayCost = (cost: number): number | string => {
  const hideAmounts = store.getState().aucSettings.settings.hideAmounts;

  return hideAmounts ? '**' : cost;
};

export default {
  parseCost,
  getDisplayCost,
};
