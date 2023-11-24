import { io, Socket } from 'socket.io-client';
import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { getSocketIOUrl } from '@utils/url.utils.ts';
import { Slot, SlotResponse } from '@models/slot.model.ts';
import { mergeLot } from '@reducers/Slots/Slots.ts';

import { RootState } from '../index';

interface SocketIoState {
  client?: Socket | null;
  twitchSocket?: Socket | null;
  daSocket?: Socket | null;
  donatePaySocket?: Socket | null;
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

const handleLotUpdate = (request: PublicApi.LotUpdateRequest, dispatch: ThunkDispatch<RootState, any, any>) => {
  dispatch(mergeLot(request));
};

export const connectToSocketIo: ThunkAction<void, RootState, {}, Action> = (dispatch, getState) => {
  const globalSocket = io(`${getSocketIOUrl()}`, { query: { cookie: document.cookie } });
  globalSocket.on('requestLots', (_, callback) => handleLotsRequest(getState().slots.slots, callback));
  globalSocket.on('updateLot', (data) => handleLotUpdate(data, dispatch));

  const twitchSocket = io(`${getSocketIOUrl()}/twitch`, { query: { cookie: document.cookie } });
  const daSocket = io(`${getSocketIOUrl()}/da`, { query: { cookie: document.cookie } });
  const donatePaySocket = io(`${getSocketIOUrl()}/donatePay`, { query: { cookie: document.cookie } });

  dispatch(setSocket({ twitchSocket, daSocket, donatePaySocket, globalSocket }));
};

export default socketIoSlice.reducer;
