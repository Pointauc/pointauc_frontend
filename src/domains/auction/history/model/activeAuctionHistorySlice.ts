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
  timerStartedAt: string | null;
  durationMs: number;
  timerResetRequestId: number;
  pendingWinnerEvents: PendingAuctionWinnerEvent[];
}

const createInitialState = (): ActiveAuctionHistoryState => ({
  startedAt: null,
  timerStartedAt: null,
  durationMs: 0,
  timerResetRequestId: 0,
  pendingWinnerEvents: [],
});

const getRunningDurationMs = (state: ActiveAuctionHistoryState, now = Date.now()): number => {
  if (!state.timerStartedAt) {
    return state.durationMs;
  }

  return state.durationMs + Math.max(0, now - new Date(state.timerStartedAt).getTime());
};

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

const mapDropoutVariant = (format?: WheelFormat, dropoutVariant?: DropoutVariant): AuctionHistoryDropoutVariant => {
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
    startActiveAuctionTimer(state): void {
      const now = new Date().toISOString();

      if (!state.startedAt) {
        state.startedAt = now;
      }

      if (!state.timerStartedAt) {
        state.timerStartedAt = now;
      }
    },
    pauseActiveAuctionTimer(state): void {
      state.durationMs = getRunningDurationMs(state);
      state.timerStartedAt = null;
    },
    resetActiveAuctionTimer(state): void {
      state.durationMs = 0;
      state.timerStartedAt = null;
      state.timerResetRequestId += 1;
    },
    setActiveAuctionTimerDuration(state, action: PayloadAction<number>): void {
      state.durationMs = Math.max(0, action.payload);

      if (state.timerStartedAt) {
        state.timerStartedAt = new Date().toISOString();
      }
    },
    resetActiveAuctionHistory(state): void {
      const timerResetRequestId = state.timerResetRequestId + 1;
      Object.assign(state, createInitialState());
      state.timerResetRequestId = timerResetRequestId;
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
  startActiveAuctionTimer,
  pauseActiveAuctionTimer,
  resetActiveAuctionTimer,
  setActiveAuctionTimerDuration,
  resetActiveAuctionHistory,
  addWheelWinnerCandidate,
  confirmLatestWinnerCandidate,
  rerollLatestWinnerCandidate,
} = activeAuctionHistorySlice.actions;

export default activeAuctionHistorySlice.reducer;
