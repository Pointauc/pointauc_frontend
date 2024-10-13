import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IntegrationAvailability, IntegrationDataDto } from '@models/user.model.ts';

export interface UserInfo {
  username?: string | null;
  userId?: string | null;
}

export interface UserState extends UserInfo {
  activeSettingsPresetId: string;
  authData: {
    donatePay?: IntegrationDataDto;
    da?: IntegrationDataDto;
    twitch?: IntegrationDataDto;
  };
  events: {
    aukus: IntegrationAvailability;
  };
}

const initialState: UserState = {
  username: null,
  userId: null,
  activeSettingsPresetId: '',
  authData: {},
  events: { aukus: { isValid: false } },
};

interface EventStatePayload {
  key: keyof UserState['events'];
  value: Partial<IntegrationAvailability>;
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setEventState(state, action: PayloadAction<EventStatePayload>): void {
      state.events[action.payload.key] = { ...state.events[action.payload.key], ...action.payload.value };
    },
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
    mergeAuthData(state, action: PayloadAction<UserState['authData']>): void {
      state.authData = { ...state.authData, ...action.payload };
    },
  },
});

export const { setUserState, setEventState, mergeAuthData, setActiveSettingsPresetId, setUsername, setUserId } =
  userSlice.actions;

export default userSlice.reducer;
