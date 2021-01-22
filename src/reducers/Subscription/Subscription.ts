import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { RootState } from '../index';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { getCookie } from '../../utils/common.utils';

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

    if (responseType === MESSAGE_TYPES.CP_SUBSCRIBED) {
      dispatch(setTwitchSubscribeState({ actual: true, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }

    if (responseType === MESSAGE_TYPES.CP_UNSUBSCRIBED) {
      dispatch(setTwitchSubscribeState({ actual: false, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }
  };

  webSocket?.addEventListener('message', handleSubscribeResponse);
  webSocket?.send(JSON.stringify({ type, channelId: getCookie('userToken') }));
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

    if (responseType === MESSAGE_TYPES.DA_SUBSCRIBE) {
      dispatch(setDaSubscribeState({ actual: true, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }

    if (responseType === MESSAGE_TYPES.DA_UNSUBSCRIBE) {
      dispatch(setDaSubscribeState({ actual: false, loading: false }));
      webSocket?.removeEventListener('message', handleSubscribeResponse);
    }
  };

  webSocket?.addEventListener('message', handleSubscribeResponse);
  webSocket?.send(JSON.stringify({ type, channelId: getCookie('userToken') }));
  dispatch(setDaSubscribeState({ loading: true }));
};

export default subscriptionSlice.reducer;
