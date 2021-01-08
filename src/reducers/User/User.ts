import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { getUsername } from '../../api/userApi';

interface UserState {
  username: string | null;
  hasDAAuth: boolean;
}

const initialState: UserState = {
  username: null,
  hasDAAuth: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername(state, action: PayloadAction<string | null>): void {
      state.username = action.payload;
    },
    setHasDAAuth(state, action: PayloadAction<boolean>): void {
      state.hasDAAuth = action.payload;
    },
  },
});

export const { setUsername, setHasDAAuth } = userSlice.actions;

export const updateUsername = async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<void> => {
  const newUsername = await getUsername();

  dispatch(setUsername(newUsername));
};

export default userSlice.reducer;
