import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { RootState } from '../index';
import { MESSAGE_TYPES, SERVER_MESSAGES } from '../../constants/webSocket.constants';

interface SubscribeState {
  actual: boolean;
  loading: boolean;
}

interface SubscriptionStoreState {
  twitch: SubscribeState;
  da: SubscribeState;
}

export const initialState: SubscriptionStoreState = {
  twitch: {
    actual: false,
    loading: false,
  },
  da: {
    actual: false,
    loading: false,
  },
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setTwitchSubscribeState(state, action: PayloadAction<Partial<SubscribeState>>): void {
      state.twitch = { ...state.twitch, ...action.payload };
    },
    setDaSubscribeState(state, action: PayloadAction<Partial<SubscribeState>>): void {
      state.da = { ...state.da, ...action.payload };
    },
  },
});

const { setDaSubscribeState, setTwitchSubscribeState } = subscriptionSlice.actions;

export const sendCpSubscribedState = (isSubscribed: boolean) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { webSocket } = getState().pubSubSocket;
  const type = isSubscribed ? MESSAGE_TYPES.CHANNEL_POINTS_SUBSCRIBE : MESSAGE_TYPES.CHANNEL_POINTS_UNSUBSCRIBE;
  const handleSubscribeResponse = ({ data }: MessageEvent): void => {
    const { type: responseType } = JSON.parse(data);

    if (responseType === SERVER_MESSAGES.CP_SUBSCRIBED) {
      dispatch(setTwitchSubscribeState({ actual: true, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }

    if (responseType === SERVER_MESSAGES.CP_UNSUBSCRIBED) {
      dispatch(setTwitchSubscribeState({ actual: false, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }
  };

  webSocket?.addEventListener('message', handleSubscribeResponse);
  webSocket?.send(JSON.stringify({ type }));
  dispatch(setTwitchSubscribeState({ loading: true }));
};

export const sendDaSubscribedState = (isSubscribed: boolean) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { webSocket } = getState().pubSubSocket;
  const type = isSubscribed ? MESSAGE_TYPES.DA_SUBSCRIBE : MESSAGE_TYPES.DA_UNSUBSCRIBE;

  const handleSubscribeResponse = ({ data }: MessageEvent): void => {
    const { type: responseType } = JSON.parse(data);

    if (responseType === SERVER_MESSAGES.DA_SUBSCRIBED) {
      dispatch(setDaSubscribeState({ actual: true, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }

    if (responseType === SERVER_MESSAGES.DA_UNSUBSCRIBED) {
      dispatch(setDaSubscribeState({ actual: false, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }
  };

  webSocket?.addEventListener('message', handleSubscribeResponse);
  webSocket?.send(JSON.stringify({ type }));
  dispatch(setDaSubscribeState({ loading: true }));
};

export default subscriptionSlice.reducer;
