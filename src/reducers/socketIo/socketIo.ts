import { io, Socket } from 'socket.io-client';
import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';

import { getSocketIOUrl } from '@utils/url.utils.ts';

import { RootState } from '../index';

interface SocketIoState {
  client?: Socket | null;
  twitchSocket?: Socket | null;
  daSocket?: Socket | null;
  donatePaySocket?: Socket | null;
  globalSocket?: Socket | null;
}

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

export const connectToSocketIo = (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
  const globalSocket = io(`${getSocketIOUrl()}`, { query: { cookie: document.cookie } });
  const twitchSocket = io(`${getSocketIOUrl()}/twitch`, { query: { cookie: document.cookie } });
  const daSocket = io(`${getSocketIOUrl()}/da`, { query: { cookie: document.cookie } });
  const donatePaySocket = io(`${getSocketIOUrl()}/donatePay`, { query: { cookie: document.cookie } });

  dispatch(setSocket({ twitchSocket, daSocket, donatePaySocket, globalSocket }));
};

export default socketIoSlice.reducer;
