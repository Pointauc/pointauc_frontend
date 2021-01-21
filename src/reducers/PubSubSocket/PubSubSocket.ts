import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import WebSocketService from '../../services/WebSocketService';
import { Purchase } from '../Purchases/Purchases';
import { MESSAGE_TYPES, WEBSOCKET_URL } from '../../constants/webSocket.constants';
import { getCookie } from '../../utils/common.utils';
import { RootState } from '../index';

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

export const connectToServer = () => (dispatch: ThunkDispatch<{}, {}, Action>): void => {
  const onOpen = (ws: WebSocket): void => {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT, channelId: getCookie('userToken') }));

    setInterval(() => {
      if (ws) {
        ws.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT, channelId: getCookie('userToken') }));
      }
    }, 1000 * 60 * 60);
    dispatch(setWebSocket(ws));
  };
  const onClose = (): void => {
    dispatch(setWebSocket(undefined));
  };

  const webSocketService = new WebSocketService<Purchase>(onClose, onOpen);
  webSocketService.connect(WEBSOCKET_URL);
};

export const sendCpSubscribedState = (isSubscribed: boolean) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { webSocket } = getState().pubSubSocket;
  const type = isSubscribed ? MESSAGE_TYPES.CHANNEL_POINTS_SUBSCRIBE : MESSAGE_TYPES.CHANNEL_POINTS_UNSUBSCRIBE;

  webSocket?.send(JSON.stringify({ type, channelId: getCookie('userToken') }));
};

export const sendDaSubscribedState = (isSubscribed: boolean) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { webSocket } = getState().pubSubSocket;
  const type = isSubscribed ? MESSAGE_TYPES.DA_SUBSCRIBE : MESSAGE_TYPES.DA_UNSUBSCRIBE;

  webSocket?.send(JSON.stringify({ type, channelId: getCookie('userToken') }));
};

export default puSubSocketSlice.reducer;
