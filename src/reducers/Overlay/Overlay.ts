import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OverlayState {
  darkAlpha: number | null;
}

const initialState: OverlayState = {
  darkAlpha: null,
};

export const overlaySlice = createSlice({
  name: 'overlay',
  initialState,
  reducers: {
    setDarkAlpha: (state, action: PayloadAction<number | null>) => {
      state.darkAlpha = action.payload;
    },
  },
});

export const { setDarkAlpha } = overlaySlice.actions;
export default overlaySlice.reducer;
