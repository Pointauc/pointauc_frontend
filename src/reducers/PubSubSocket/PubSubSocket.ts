import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import axios from 'axios';
import WebSocketService from '../../services/WebSocketService';
import { Purchase } from '../Purchases/Purchases';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { getWebsocketUrl } from '../../utils/url.utils';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import { RootState } from '../index';
import { sendCpSubscribedState, sendDaSubscribedState } from '../Subscription/Subscription';

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

export const connectToServer =
  (showSuccessMessage?: boolean) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    let interval: NodeJS.Timeout;
    const {
      twitch: { actual: twitchSub },
      da: { actual: daSub },
    } = getState().subscription;

    const onOpen = (ws: WebSocket): void => {
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT }));

      interval = setInterval(() => {
        if (ws) {
          ws.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT }));
        }

        axios.get('api/isAlive');
      }, 1000 * 60 * 30);

      dispatch(setWebSocket(ws));
      if (showSuccessMessage) {
        dispatch(
          addAlert({
            message: 'Соединение установлено',
            type: AlertTypeEnum.Success,
            duration: 3000,
          }),
        );
      }

      if (twitchSub) {
        dispatch(sendCpSubscribedState(twitchSub));
      }

      if (daSub) {
        dispatch(sendDaSubscribedState(daSub));
      }
    };

    const onClose = (): void => {
      dispatch(setWebSocket(undefined));
      dispatch(
        addAlert({
          message: 'Произошло отключение от сервера, подождите пару секунд, сейчас все переподключится',
          type: AlertTypeEnum.Error,
          duration: 7000,
        }),
      );
      clearInterval(interval);
    };

    const webSocketService = new WebSocketService<Purchase>(onClose, onOpen);
    webSocketService.connect(getWebsocketUrl());
  };

export default puSubSocketSlice.reducer;
