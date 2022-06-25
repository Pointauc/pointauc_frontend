import { io, Socket } from 'socket.io-client';
import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { RootState } from '../index';
import { getSocketIOUrl } from '../../utils/url.utils';

interface SocketIoState {
  client?: Socket | null;
  twitchSocket?: Socket | null;
  daSocket?: Socket | null;
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
  const twitchSocket = io(`${getSocketIOUrl()}/twitch`, { query: { cookie: document.cookie } });
  const daSocket = io(`${getSocketIOUrl()}/da`, { query: { cookie: document.cookie } });

  dispatch(setSocket({ twitchSocket, daSocket }));
};

export default socketIoSlice.reducer;
