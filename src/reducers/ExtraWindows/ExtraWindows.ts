import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trailer } from '../../models/extraWindows';

interface ExtraWindowsState {
  trailers: Trailer[];
}

const initialState: ExtraWindowsState = {
  trailers: [],
};

const extraWindowsSlice = createSlice({
  name: 'extraWindows',
  initialState,
  reducers: {
    openTrailer(state, action: PayloadAction<string>): void {
      state.trailers = [...state.trailers, { title: action.payload, id: Math.random() }];
    },
    closeTrailer(state, action: PayloadAction<number>): void {
      state.trailers = state.trailers.filter(({ id }) => id !== action.payload);
    },
  },
});

export const { openTrailer, closeTrailer } = extraWindowsSlice.actions;

export default extraWindowsSlice.reducer;
