import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationsState {
  message: string | null;
}

const initialState: NotificationsState = {
  message: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotification(state, action: PayloadAction<string | null>): void {
      state.message = action.payload;
    },
  },
});

export const { setNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
