import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  username: string | null;
  userId: string | null;
}

interface UserState extends UserInfo {
  hasDAAuth: boolean;
}

const initialState: UserState = {
  username: null,
  userId: null,
  hasDAAuth: false,
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
  },
});

export const { setUsername, setHasDAAuth, setUserId } = userSlice.actions;

export default userSlice.reducer;
