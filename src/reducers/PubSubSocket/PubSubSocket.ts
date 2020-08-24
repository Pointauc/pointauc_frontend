import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import WebSocketService from '../../services/WebSocketService';
import { Purchase } from '../Purchases/Purchases';
import { WEBSOCKET_URL } from '../../constants/webSocket.constants';

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
    connectToServer(state): void {
      const onOpen = (ws: WebSocket): void => {
        state.webSocket = ws;
      };
      const onClose = (): void => {
        state.webSocket = undefined;
      };

      const webSocketService = new WebSocketService<Purchase>(onClose, onOpen);
      webSocketService.connect(WEBSOCKET_URL);
    },
  },
});

export const { setWebSocket } = puSubSocketSlice.actions;

export const connectToServer = () => (dispatch: ThunkDispatch<{}, {}, Action>): void => {
  const onOpen = (ws: WebSocket): void => {
    dispatch(setWebSocket(ws));
  };
  const onClose = (): void => {
    dispatch(setWebSocket(undefined));
  };

  const webSocketService = new WebSocketService<Purchase>(onClose, onOpen);
  webSocketService.connect(WEBSOCKET_URL);
};

export default puSubSocketSlice.reducer;
