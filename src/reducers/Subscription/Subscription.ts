import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { Socket } from 'socket.io-client';

import { AlertTypeEnum } from '@models/alert.model.ts';
import { getIntegrationsValidity } from '@api/userApi.ts';
import { integrations } from '@components/Integration/integrations.ts';

import { RootState } from '../index';
import { addAlert } from '../notifications/notifications';
import { setUserState } from '../User/User';

export interface SubscribeState {
  actual: boolean;
  loading: boolean;
}

interface SubscriptionStoreState {
  twitch: SubscribeState;
  da: SubscribeState;
  donatePay: SubscribeState;
}

const initialSubscribeState = {
  actual: false,
  loading: false,
};

export const initialState: SubscriptionStoreState = {
  twitch: initialSubscribeState,
  da: initialSubscribeState,
  donatePay: initialSubscribeState,
};

interface SetSubscribeProps {
  id: Integration.ID;
  state: Partial<SubscribeState>;
}

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
    setDonatePaySubscribeState(state, action: PayloadAction<Partial<SubscribeState>>): void {
      state.donatePay = { ...state.donatePay, ...action.payload };
    },
    setSubscribeState(state, action: PayloadAction<SetSubscribeProps>): void {
      state[action.payload.id] = { ...state[action.payload.id], ...action.payload.state };
    },
    setSubscribeStateAll(state, action: PayloadAction<Partial<SubscribeState>>): void {
      state.twitch = { ...state.twitch, ...action.payload };
      state.da = { ...state.da, ...action.payload };
      state.donatePay = { ...state.donatePay, ...action.payload };
    },
  },
});

export const {
  setSubscribeStateAll,
  setDaSubscribeState,
  setSubscribeState,
  setTwitchSubscribeState,
  setDonatePaySubscribeState,
} = subscriptionSlice.actions;

export const validateIntegrations = async (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): Promise<void> => {
  dispatch(setSubscribeStateAll({ loading: true }));
  const {
    user: { authData },
  } = getState();

  const validity = await getIntegrationsValidity();
  const nextAuthData = integrations.all.reduce((acc, { authFlow, id }) => {
    const data = validity[`${id}Auth`] && authFlow.validate() ? authData[id] : undefined;

    return { ...acc, [id]: data };
  }, {});

  dispatch(
    setUserState({
      authData: nextAuthData,
    }),
  );

  dispatch(setSubscribeStateAll({ loading: false }));
};

const sendSubscribeState = async (
  socket: Socket,
  isSubscribed: boolean,
  dispatch: ThunkDispatch<{}, {}, Action>,
  // stateChangeActionCreator: ActionCreatorWithPayload<Partial<SubscribeState>>,
) => {
  const event = isSubscribed ? 'bidsSubscribe' : 'bidsUnsubscribe';

  if (!socket) {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    socket.once('bidsStateChange', ({ state, error }) => {
      // dispatch(stateChangeActionCreator({ actual: state, loading: false }));

      if (error) {
        dispatch(addAlert({ type: AlertTypeEnum.Error, message: error }));
        reject();
      } else {
        resolve();
      }
    });
    socket.emit(event);

    // dispatch(stateChangeActionCreator({ loading: true }));
  });
};

export const sendCpSubscribedState =
  (isSubscribed: boolean) => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => RootState) => {
    const { twitchSocket } = getState().socketIo;

    if (twitchSocket) {
      await sendSubscribeState(twitchSocket, isSubscribed, dispatch);
    }
  };

export const sendDaSubscribedState =
  (isSubscribed: boolean) => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => RootState) => {
    const { daSocket } = getState().socketIo;

    if (daSocket) {
      await sendSubscribeState(daSocket, isSubscribed, dispatch);
    }
  };

export default subscriptionSlice.reducer;
