import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LotLinkParsingStatus {
  sourceName: string | null;
}

interface LotLinkParsingState {
  loadingByLotId: Record<string, LotLinkParsingStatus>;
}

const initialState: LotLinkParsingState = {
  loadingByLotId: {},
};

const lotLinkParsingSlice = createSlice({
  name: 'lotLinkParsing',
  initialState,
  reducers: {
    setLotLinkParsingLoading(state, action: PayloadAction<{ lotId: string; sourceName: string | null }>): void {
      const { lotId, sourceName } = action.payload;
      state.loadingByLotId[lotId] = { sourceName };
    },
    clearLotLinkParsingLoading(state, action: PayloadAction<string>): void {
      delete state.loadingByLotId[action.payload];
    },
  },
});

export const { clearLotLinkParsingLoading, setLotLinkParsingLoading } = lotLinkParsingSlice.actions;

export default lotLinkParsingSlice.reducer;
