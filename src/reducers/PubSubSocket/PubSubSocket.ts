import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import WebSocketService from '../../services/WebSocketService';
import { Purchase } from '../Purchases/Purchases';
import { MESSAGE_TYPES, WEBSOCKET_URL } from '../../constants/webSocket.constants';

interface PubSubSocketState {
  webSocket?: WebSocket;
}

const initialState: PubSubSocketState = {
  webSocket: undefined,
};

const puSubSocketSlice = createSlice({
  name: 'pubSubSocket',
  initialState,
  reducers: {
    setWebSocket(state, action: PayloadAction<WebSocket | undefined>): void {
      state.webSocket = action.payload;
    },
  },
});

export const { setWebSocket } = puSubSocketSlice.actions;

export const connectToServer = (username: string) => (dispatch: ThunkDispatch<{}, {}, Action>): void => {
  const onOpen = (ws: WebSocket): void => {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT, username }));
    dispatch(setWebSocket(ws));
  };
  const onClose = (): void => {
    dispatch(setWebSocket(undefined));
  };

  const webSocketService = new WebSocketService<Purchase>(onClose, onOpen);
  webSocketService.connect(WEBSOCKET_URL);
};

export default puSubSocketSlice.reducer;
