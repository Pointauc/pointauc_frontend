import { buildYoutubeVideoUrl } from '@domains/links/participant-url-parsing/sources/youtube/helpers';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { processRedemption } from '@reducers/Purchases/Purchases';
import { addBid, createSlot, setSlots } from '@reducers/Slots/Slots';

import { LOTS_BELOW_VIRTUAL_LIST_LIMIT } from '../config/auctionList';
import { TOP_TRENDING_YOUTUBE_VIDEO_IDS } from '../config/youtubeVideoIds';
import { getRandomInt, getRandomItem, getRandomWords } from '../lib/random';

import type { Lot } from '@models/slot.model';
import type { Purchase } from '@reducers/Purchases/Purchases';
import type { RootState } from '@reducers/index';

interface AppStore {
  dispatch: (action: unknown) => unknown;
  getState: () => RootState;
}

interface BidFrequencyConfig {
  existingLotsPerSecond: number;
  randomLotsPerSecond: number;
}

const createTestingLot = (index: number, name: string): Lot =>
  createSlot({
    id: `testing-lot-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    name,
    amount: getRandomInt(10, 5000),
    contributors: [{ name: `testing-user-${getRandomInt(1, 200)}`, amount: getRandomInt(10, 5000) }],
  });

const createRandomLots = (count: number): Lot[] => {
  return Array.from({ length: count }, (_, index) => createTestingLot(index, `Testing lot ${index + 1}`));
};

const createYoutubeLots = (count: number): Lot[] => {
  return Array.from({ length: count }, (_, index) => {
    const videoId = TOP_TRENDING_YOUTUBE_VIDEO_IDS[index % TOP_TRENDING_YOUTUBE_VIDEO_IDS.length];
    const videoUrl = buildYoutubeVideoUrl(videoId);

    return createTestingLot(index, videoUrl);
  });
};

const createTestingBid = (message: string): Purchase => ({
  id: `testing-bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  timestamp: new Date().toISOString(),
  username: `testing-user-${getRandomInt(1, 1000)}`,
  color: '#22c55e',
  cost: getRandomInt(1, 250),
  source: 'Mock',
  message,
});

const seedLots = (store: AppStore, lots: Lot[]): void => {
  store.dispatch(setSlots(lots));
};

const sendExistingLotBid = (store: AppStore): void => {
  const lots = store.getState().slots.slots.filter((slot) => slot.name);
  if (!lots.length) {
    return;
  }

  const lot = getRandomItem(lots);
  const bid = createTestingBid(lot.name ?? '');

  store.dispatch(addBid(lot, bid, { removeBid: false }));
};

const sendRandomTextBid = (store: AppStore): void => {
  const bid = {
    ...createTestingBid(getRandomWords(getRandomInt(2, 5))),
    insertStrategy: InsertStrategy.Force,
  };

  store.dispatch(processRedemption(bid));
};

const runBidBurst = (store: AppStore, config: BidFrequencyConfig): void => {
  Array.from({ length: config.existingLotsPerSecond }).forEach(() => sendExistingLotBid(store));
  Array.from({ length: config.randomLotsPerSecond }).forEach(() => sendRandomTextBid(store));
};

const startBidScenario = (store: AppStore, config: BidFrequencyConfig): (() => void) => {
  runBidBurst(store, config);

  const intervalId = window.setInterval(() => runBidBurst(store, config), 1000);

  return () => window.clearInterval(intervalId);
};

export const createAuctionTestingScenarios = (store: AppStore) => ({
  seedRandomLots3000: (): void => seedLots(store, createRandomLots(3000)),
  seedRandomLotsBelowVirtualListLimit: (): void => seedLots(store, createRandomLots(LOTS_BELOW_VIRTUAL_LIST_LIMIT)),
  seedRandomYoutubeVideos400: (): void => seedLots(store, createYoutubeLots(400)),
  seedRandomYoutubeVideosBelowVirtualListLimit: (): void =>
    seedLots(store, createYoutubeLots(LOTS_BELOW_VIRTUAL_LIST_LIMIT)),
  startHighFrequencyBids: (): (() => void) =>
    startBidScenario(store, {
      existingLotsPerSecond: 4,
      randomLotsPerSecond: 1,
    }),
  startUltraHighFrequencyBids: (): (() => void) =>
    startBidScenario(store, {
      existingLotsPerSecond: 16,
      randomLotsPerSecond: 4,
    }),
});
