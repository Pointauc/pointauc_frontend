import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { RootState } from '../index';

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

export const sendCpSubscribedState =
  (isSubscribed: boolean, setState?: (actual: boolean) => void) =>
  (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => RootState): void => {
    const { twitchSocket } = getState().socketIo;
    const event = isSubscribed ? 'bidsSubscribe' : 'bidsUnsubscribe';

    if (!twitchSocket) {
      return;
    }

    twitchSocket.once('bidsStateChange', ({ state }) => {
      dispatch(setTwitchSubscribeState({ actual: state, loading: false }));
      setState && setState(state);
    });
    twitchSocket.emit(event);

    dispatch(setTwitchSubscribeState({ loading: true }));
  };

export const sendDaSubscribedState =
  (isSubscribed: boolean) =>
  (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => RootState): void => {
    const { daSocket } = getState().socketIo;
    const event = isSubscribed ? 'bidsSubscribe' : 'bidsUnsubscribe';

    if (!daSocket) {
      return;
    }

    daSocket.once('bidsStateChange', ({ state }) => {
      dispatch(setDaSubscribeState({ actual: state, loading: false }));
    });

    daSocket.emit(event);

    dispatch(setDaSubscribeState({ loading: true }));
  };

export default subscriptionSlice.reducer;
