import { PurchaseLog } from '../reducers/Purchases/Purchases';

export interface Score {
  title: string;
  score: number;
}

export interface TimeScore {
  score: number;
  timestamp: number;
}

export type CostSelectorType = (bid: PurchaseLog) => number;
