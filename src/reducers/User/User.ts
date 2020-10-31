import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { getUsername } from '../../api/userApi';

interface UserState {
  username: string | null;
}

const initialState: UserState = {
  username: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername(state, action: PayloadAction<string | null>): void {
      state.username = action.payload;
    },
  },
});

export const { setUsername } = userSlice.actions;

export const updateUsername = async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<void> => {
  const newUsername = await getUsername();

  dispatch(setUsername(newUsername));
};

export default userSlice.reducer;
