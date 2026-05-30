import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { WheelFormat } from '@constants/wheel';
import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/DropoutVariant';

import type {
  AuctionHistoryDropoutVariant,
  AuctionHistoryWheelVariant,
  CreateWheelWinnerCandidateParams,
  PendingAuctionWinnerEvent,
} from './types';

interface ActiveAuctionHistoryState {
  startedAt: string | null;
  pendingWinnerEvents: PendingAuctionWinnerEvent[];
}

const createInitialState = (): ActiveAuctionHistoryState => ({
  startedAt: null,
  pendingWinnerEvents: [],
});

const mapWheelVariant = (format?: WheelFormat): AuctionHistoryWheelVariant => {
  switch (format) {
    case WheelFormat.Dropout:
      return 'dropout';
    case WheelFormat.BattleRoyal:
      return 'battleRoyal';
    case WheelFormat.Default:
    default:
      return 'default';
  }
};

const mapDropoutVariant = (
  format?: WheelFormat,
  dropoutVariant?: DropoutVariant,
): AuctionHistoryDropoutVariant => {
  if (format !== WheelFormat.Dropout) {
    return 'none';
  }

  return dropoutVariant === DropoutVariant.Classic ? 'classic' : 'new';
};

const activeAuctionHistorySlice = createSlice({
  name: 'activeAuctionHistory',
  initialState: createInitialState(),
  reducers: {
    ensureActiveAuctionStarted(state): void {
      if (!state.startedAt) {
        state.startedAt = new Date().toISOString();
      }
    },
    resetActiveAuctionHistory(state): void {
      Object.assign(state, createInitialState());
    },
    addWheelWinnerCandidate(state, action: PayloadAction<CreateWheelWinnerCandidateParams>): void {
      state.pendingWinnerEvents.push({
        id: crypto.randomUUID(),
        runtimeLotId: action.payload.runtimeLotId,
        method: 'wheel',
        status: 'candidate',
        randomNumber: action.payload.randomNumber,
        chancePercent: action.payload.chancePercent,
        wheelVariant: mapWheelVariant(action.payload.format),
        dropoutVariant: mapDropoutVariant(action.payload.format, action.payload.dropoutVariant),
        createdAt: new Date().toISOString(),
      });
    },
    confirmLatestWinnerCandidate(state): void {
      const candidate = [...state.pendingWinnerEvents].reverse().find(({ status }) => status === 'candidate');

      if (candidate) {
        candidate.status = 'confirmed';
      }
    },
    rerollLatestWinnerCandidate(state): void {
      const candidate = [...state.pendingWinnerEvents].reverse().find(({ status }) => status === 'candidate');

      if (candidate) {
        candidate.status = 'rerolled';
      }
    },
  },
});

export const {
  ensureActiveAuctionStarted,
  resetActiveAuctionHistory,
  addWheelWinnerCandidate,
  confirmLatestWinnerCandidate,
  rerollLatestWinnerCandidate,
} = activeAuctionHistorySlice.actions;

export default activeAuctionHistorySlice.reducer;
