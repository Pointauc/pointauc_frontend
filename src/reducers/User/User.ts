import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { RootState } from '../index';
import { initChatClient } from '../Requests/Requests';

export interface UserInfo {
  username: string | null;
  userId: string | null;
}

interface UserState extends UserInfo {
  hasDAAuth: boolean;
  hasTwitchAuth: boolean;
}

const initialState: UserState = {
  username: null,
  userId: null,
  hasDAAuth: false,
  hasTwitchAuth: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername(state, action: PayloadAction<string | null>): void {
      state.username = action.payload;
    },
    setUserId(state, action: PayloadAction<string | null>): void {
      state.userId = action.payload;
    },
    setHasDAAuth(state, action: PayloadAction<boolean>): void {
      state.hasDAAuth = action.payload;
    },
    setHasTwitchAuth(state, action: PayloadAction<boolean>): void {
      state.hasTwitchAuth = action.payload;
    },
  },
});

export const { setUsername, setHasDAAuth, setUserId, setHasTwitchAuth } = userSlice.actions;

export const updateUsername =
  (username: string) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
    dispatch(setUsername(username));
    dispatch(initChatClient(username));
  };

export default userSlice.reducer;
