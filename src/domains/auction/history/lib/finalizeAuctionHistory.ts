import { resetPurchases } from '@reducers/Purchases/Purchases';
import { resetSlots } from '@reducers/Slots/Slots';
import { store } from '@store';

import auctionHistoryApi from '../api/IndexedDBAdapter';
import { resetActiveAuctionHistory } from '../model/activeAuctionHistorySlice';

import { buildAuctionHistorySnapshot } from './buildAuctionHistorySnapshot';

interface FinalizeAuctionHistoryParams {
  name: string;
  shouldSave: boolean;
}

export const clearActiveAuctionState = (): void => {
  store.dispatch(resetSlots());
  store.dispatch(resetPurchases());
  store.dispatch(resetActiveAuctionHistory());
};

export const finalizeAuctionHistory = async ({ name, shouldSave }: FinalizeAuctionHistoryParams): Promise<void> => {
  const state = store.getState();

  if (shouldSave) {
    const endedAt = new Date().toISOString();
    const snapshot = buildAuctionHistorySnapshot({
      auctionId: crypto.randomUUID(),
      auctionName: name.trim() || (await auctionHistoryApi.getNextDefaultName()),
      startedAt: state.activeAuctionHistory.startedAt ?? endedAt,
      endedAt,
      pointsToDonationRatio: Number(state.aucSettings.settings.pointsRate ?? 1),
      lots: state.slots.slots,
      purchases: state.purchases.history,
      pendingWinnerEvents: state.activeAuctionHistory.pendingWinnerEvents,
    });

    if (snapshot.auction.lotCount > 0) {
      await auctionHistoryApi.saveSnapshot(snapshot);
    }
  }

  clearActiveAuctionState();
};
