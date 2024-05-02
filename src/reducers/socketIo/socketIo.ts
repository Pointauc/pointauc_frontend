import { io, Socket } from 'socket.io-client';
import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { getSocketIOUrl } from '@utils/url.utils.ts';
import { Slot, SlotResponse } from '@models/slot.model.ts';
import { mergeLot } from '@reducers/Slots/Slots.ts';
import { addedBidsMap, Purchase, PurchaseLog } from '@reducers/Purchases/Purchases.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { setDaSubscribeState, setTwitchSubscribeState } from '@reducers/Subscription/Subscription.ts';
import da from '@components/Integration/DA';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';

import { RootState } from '../index';

interface SocketIoState {
  client?: Socket | null;
  twitchSocket?: Socket | null;
  daSocket?: Socket | null;
  globalSocket?: Socket | null;
}

type SocketCallback<T> = (response: T) => void;

const initialState: SocketIoState = {
  client: null,
};

const socketIoSlice = createSlice({
  name: 'socketIo',
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<SocketIoState>): void {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSocket } = socketIoSlice.actions;

const handleLotsRequest = (lots: Slot[], callback: SocketCallback<SlotResponse[]>) => {
  callback(lots.map(({ extra, ...lot }) => lot));
};

const handleBidStatusRequest = (
  bidId: string,
  history: PurchaseLog[],
  bids: Purchase[],
  callback: SocketCallback<PublicApi.BidStatus>,
) => {
  const lotId = addedBidsMap.get(bidId);
  if (lotId) {
    return callback({ status: 'processed', lot: { id: lotId } });
  }

  const historicData = history.find(({ id }) => id === bidId);
  if (historicData?.status === PurchaseStatusEnum.Deleted) {
    return callback({ status: 'rejected' });
  }

  const queueData = bids.find(({ id }) => id === bidId);
  if (queueData) {
    return callback({ status: 'pending' });
  }

  callback({ status: 'notFound' });
};

const handleLotUpdate = (request: PublicApi.LotUpdateRequest, dispatch: ThunkDispatch<RootState, any, any>) => {
  dispatch(mergeLot(request));
};

export const connectToSocketIo: ThunkAction<void, RootState, {}, Action> = (dispatch, getState) => {
  const globalSocket = io(`${getSocketIOUrl()}`, { query: { cookie: document.cookie } });
  globalSocket.on('requestLots', (_, callback) => handleLotsRequest(getState().slots.slots, callback));
  globalSocket.on('updateLot', (data) => handleLotUpdate(data, dispatch));
  globalSocket.on('requestBidStatus', (bidId, callback) =>
    handleBidStatusRequest(bidId, getState().purchases.history, getState().purchases.purchases, callback),
  );

  const twitchSocket = io(`${getSocketIOUrl()}/twitch`, { query: { cookie: document.cookie } });
  const daSocket = io(`${getSocketIOUrl()}/da`, { query: { cookie: document.cookie } });

  let statesBeforeDisconnect = { twitch: false, da: false };

  globalSocket.on('connect', () => {
    const { user } = getState();
    const { twitch: twitchPrevious, da: daPrevious } = statesBeforeDisconnect;

    if (user.authData.twitch && twitchPrevious) {
      integrationUtils.setSubscribeState(twitch, twitchPrevious, true);
    } else {
      dispatch(setTwitchSubscribeState({ loading: false }));
    }

    if (user.authData.da && daPrevious) {
      integrationUtils.setSubscribeState(da, daPrevious, true);
    } else {
      dispatch(setDaSubscribeState({ loading: false }));
    }
  });

  globalSocket.on('disconnect', () => {
    const { subscription, user } = getState();
    const {
      twitch: { actual: twitchPrevious },
      da: { actual: daPrevious },
    } = subscription;

    statesBeforeDisconnect = { twitch: twitchPrevious, da: daPrevious };

    dispatch(setTwitchSubscribeState({ loading: true, actual: false }));
    dispatch(setDaSubscribeState({ loading: true, actual: false }));
  });

  dispatch(setSocket({ twitchSocket, daSocket, globalSocket }));
};

export default socketIoSlice.reducer;
