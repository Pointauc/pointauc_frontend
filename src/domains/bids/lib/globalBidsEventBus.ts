import EventEmitter from 'eventemitter3';

import { Purchase } from '@reducers/Purchases/Purchases.ts';

export type GlobalBidsEvents = {
  bid: (bid: Purchase) => void;
};

export const globalBidsEventBus = new EventEmitter<GlobalBidsEvents>();

type GlobalBidConsumer = (bid: Purchase) => boolean | Promise<boolean>;

const globalBidConsumers = new Set<GlobalBidConsumer>();
let globalBidFallbackConsumer: GlobalBidConsumer | null = null;

/**
 * Registers a high-priority bid consumer.
 * Consumers can claim a bid by returning `true`, which skips the fallback consumer.
 */
export const registerGlobalBidConsumer = (consumer: GlobalBidConsumer): (() => void) => {
  globalBidConsumers.add(consumer);

  return () => {
    globalBidConsumers.delete(consumer);
  };
};

/**
 * Registers the default bid consumer used when no higher-priority consumer
 * handled the bid. This is intended for the existing auction ingestion path.
 */
export const registerGlobalBidFallbackConsumer = (consumer: GlobalBidConsumer): (() => void) => {
  globalBidFallbackConsumer = consumer;

  return () => {
    if (globalBidFallbackConsumer === consumer) {
      globalBidFallbackConsumer = null;
    }
  };
};

/**
 * Publishes a bid to passive listeners first, then gives active consumers a
 * chance to claim it before falling back to the auction pipeline.
 */
export const publishGlobalBid = async (bid: Purchase): Promise<boolean> => {
  globalBidsEventBus.emit('bid', bid);

  for (const consumer of globalBidConsumers) {
    const isHandled = await consumer(bid);

    if (isHandled) {
      return true;
    }
  }

  if (!globalBidFallbackConsumer) {
    return false;
  }

  return globalBidFallbackConsumer(bid);
};
