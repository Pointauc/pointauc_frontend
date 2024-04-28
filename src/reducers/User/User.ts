import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { IntegrationDataDto } from '@models/user.model.ts';

import { RootState } from '../index';
import { initChatClient } from '../Requests/Requests';

export interface UserInfo {
  username?: string | null;
  userId?: string | null;
}

export interface UserState extends UserInfo {
  hasDAAuth: boolean;
  hasTwitchAuth: boolean;
  hasDonatPayAuth: boolean;
  activeSettingsPresetId: string;
  authData: {
    donatePay?: IntegrationDataDto;
  };
}

const initialState: UserState = {
  username: null,
  userId: null,
  hasDAAuth: false,
  hasTwitchAuth: false,
  hasDonatPayAuth: false,
  activeSettingsPresetId: '',
  authData: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserState(state, action: PayloadAction<Partial<UserState>>): void {
      Object.assign(state, action.payload);
    },
    setActiveSettingsPresetId(state, action: PayloadAction<string>): void {
      state.activeSettingsPresetId = action.payload;
    },
    setUsername(state, action: PayloadAction<string | null | undefined>): void {
      state.username = action.payload;
    },
    setUserId(state, action: PayloadAction<string | null | undefined>): void {
      state.userId = action.payload;
    },
    setHasDAAuth(state, action: PayloadAction<boolean>): void {
      state.hasDAAuth = action.payload;
    },
    setHasDonatPayAuth(state, action: PayloadAction<boolean>): void {
      state.hasDonatPayAuth = action.payload;
    },
    setHasTwitchAuth(state, action: PayloadAction<boolean>): void {
      state.hasTwitchAuth = action.payload;
    },
  },
});

export const {
  setUserState,
  setActiveSettingsPresetId,
  setUsername,
  setHasDAAuth,
  setUserId,
  setHasTwitchAuth,
  setHasDonatPayAuth,
} = userSlice.actions;

export const updateUsername =
  (username: string): ThunkAction<void, RootState, {}, Action> =>
  (dispatch): void => {
    dispatch(setUsername(username));
    dispatch(initChatClient(username));
  };

export default userSlice.reducer;
