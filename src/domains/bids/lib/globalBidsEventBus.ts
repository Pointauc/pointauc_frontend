import EventEmitter from 'eventemitter3';

import { Purchase } from '@reducers/Purchases/Purchases.ts';

export type GlobalBidsEvents = {
  bid: (bid: Purchase) => void;
};

class GlobalBidsEventBus {
  private emitter = new EventEmitter<GlobalBidsEvents>();

  emit(event: GlobalBidsEvents, bid: Purchase): void {
    this.emitter.emit(event, bid);
  }

  on(event: GlobalBidsEvents, callback: (bid: Purchase) => void): () => void {
    return this.emitter.on(event, callback);
  }

  off(event: GlobalBidsEvents, callback: (bid: Purchase) => void): void {
    this.emitter.off(event, callback);
  }
}

export const globalBidsEventBus = new EventEmitter<GlobalBidsEvents>();
