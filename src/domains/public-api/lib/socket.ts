import { Socket } from 'socket.io-client';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';

import { globalBidsEventBus } from '@domains/bids/lib/globalBidsEventBus.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { RootState } from '@reducers/index.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { mergeLot } from '@reducers/Slots/Slots.ts';
import { store } from '@store';

type PublicApiSocket = Socket;
type AckCallback<T> = (response: T) => void;

const checkIsAckCallback = <T>(value: unknown): value is AckCallback<T> => typeof value === 'function';

const getCurrentStore = () => {
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  return store;
};

const mapSlotsToPublicLots = (): PublicApi.Lot[] => {
  const currentStore = getCurrentStore();
  const state = currentStore.getState() as RootState;

  return state.slots.slots.map((slot) => ({
    fastId: slot.fastId,
    id: slot.id,
    name: slot.name,
    amount: slot.amount,
    investors: slot.contributors?.map(({ name }) => name) ?? [],
  }));
};

const getBidStatus = (bidId: string): PublicApi.BidStatus => {
  const currentStore = getCurrentStore();
  const state = currentStore.getState() as RootState;
  const {
    purchases: { history, purchases },
  } = state;

  const historyEntry = history.find((purchase) => purchase.id === bidId);

  if (historyEntry?.status === PurchaseStatusEnum.Processed) {
    return historyEntry.target
      ? { status: 'processed', lot: { id: historyEntry.target } }
      : { status: 'processed' };
  }

  if (purchases.some((purchase) => purchase.id === bidId)) {
    return { status: 'pending' };
  }

  if (historyEntry) {
    return { status: 'rejected' };
  }

  return { status: 'notFound' };
};

export const registerPublicApiSocketHandlers = (
  socket: PublicApiSocket,
  dispatch: Dispatch<AnyAction>,
): (() => void) => {
  const handleBid = (bid: Purchase) => {
    globalBidsEventBus.emit('bid', { ...bid, source: 'API' });
  };

  const handleUpdateLot = (payload: PublicApi.LotUpdateRequest) => {
    dispatch(mergeLot(payload));
  };

  const handleRequestLots = (_payload: unknown, callback?: AckCallback<PublicApi.Lot[]>) => {
    if (!checkIsAckCallback(callback)) {
      return;
    }

    callback(mapSlotsToPublicLots());
  };

  const handleRequestBidStatus = (bidId: string, callback?: AckCallback<PublicApi.BidStatus>) => {
    if (!checkIsAckCallback(callback)) {
      return;
    }

    callback(getBidStatus(bidId));
  };

  socket.on('Bid', handleBid);
  socket.on('updateLot', handleUpdateLot);
  socket.on('requestLots', handleRequestLots);
  socket.on('requestBidStatus', handleRequestBidStatus);

  return () => {
    socket.off('Bid', handleBid);
    socket.off('updateLot', handleUpdateLot);
    socket.off('requestLots', handleRequestLots);
    socket.off('requestBidStatus', handleRequestBidStatus);
  };
};
