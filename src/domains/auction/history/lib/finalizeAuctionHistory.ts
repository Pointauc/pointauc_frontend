import { clearActionLog, selectPurchaseLogs } from '@reducers/ActionsLog/ActionsLog';
import { resetPurchases } from '@reducers/Purchases/Purchases';
import { resetSlots } from '@reducers/Slots/Slots';
import { store } from '@store';

import auctionHistoryApi from '../api/IndexedDBAdapter';
import { resetActiveAuctionHistory } from '../model/activeAuctionHistorySlice';

import { getActiveAuctionDurationMs } from './activeAuctionState';
import { buildAuctionHistorySnapshot } from './buildAuctionHistorySnapshot';
import { getCurrentAuctionMetadata } from './currentAuctionMetadata';

interface FinalizeAuctionHistoryParams {
  shouldSave: boolean;
}

export const clearActiveAuctionState = (): void => {
  store.dispatch(resetSlots());
  store.dispatch(resetPurchases());
  store.dispatch(clearActionLog());
  store.dispatch(resetActiveAuctionHistory());
};

export const finalizeAuctionHistory = async ({ shouldSave }: FinalizeAuctionHistoryParams): Promise<void> => {
  const state = store.getState();

  if (shouldSave) {
    const endedAt = new Date().toISOString();
    const auctionMetadata = getCurrentAuctionMetadata();
    const snapshot = buildAuctionHistorySnapshot({
      auctionId: crypto.randomUUID(),
      auctionName: auctionMetadata.name || (await auctionHistoryApi.getNextDefaultName()),
      requestsKind: auctionMetadata.requestsKind,
      startedAt: state.activeAuctionHistory.startedAt ?? endedAt,
      endedAt,
      durationMs: getActiveAuctionDurationMs(state),
      pointsToDonationRatio: Number(state.aucSettings.settings.pointsRate ?? 1),
      lots: state.slots.slots,
      purchases: selectPurchaseLogs(state),
      pendingWinnerEvents: state.activeAuctionHistory.pendingWinnerEvents,
    });

    if (snapshot.auction.lotCount > 0) {
      await auctionHistoryApi.saveSnapshot(snapshot);
    }
  }

  clearActiveAuctionState();
};
