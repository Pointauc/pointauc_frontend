import EventEmitter from 'eventemitter3';

import { Purchase } from '@reducers/Purchases/Purchases.ts';

export type GlobalBidsEvents = {
  bid: (bid: Purchase) => void;
};

export const globalBidsEventBus = new EventEmitter<GlobalBidsEvents>();
