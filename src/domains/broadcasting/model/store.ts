import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

import { Broadcasting } from './types';

interface BroadcastingState {
  broadcastingData: Record<Broadcasting.DataType, boolean>;
  socket: Socket | null;
}

const initialState: BroadcastingState = {
  broadcastingData: {
    lots: false,
    timer: false,
    rules: false,
    wheel: false,
  },
  socket: null,
};

const broadcastingSlice = createSlice({
  name: 'broadcasting',
  initialState,
  reducers: {
    updateDataState: (state, action: PayloadAction<{ dataType: Broadcasting.DataType; value: boolean }>) => {
      state.broadcastingData[action.payload.dataType] = action.payload.value;
    },
    updateAllDataStates: (state, action: PayloadAction<Record<Broadcasting.DataType, boolean>>) => {
      state.broadcastingData = action.payload;
    },
    setAllDataStates: (state, action: PayloadAction<boolean>) => {
      state.broadcastingData.lots = action.payload;
      state.broadcastingData.timer = action.payload;
      state.broadcastingData.rules = action.payload;
      state.broadcastingData.wheel = action.payload;
    },
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload as any;
    },
  },
});

export const { updateDataState, updateAllDataStates, setAllDataStates, setSocket } = broadcastingSlice.actions;

export default broadcastingSlice.reducer;
