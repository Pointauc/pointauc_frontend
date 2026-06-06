import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action, AnyAction } from 'redux';

import { PurchaseStatusEnum } from '@models/purchase.ts';
import { Lot } from '@models/slot.model.ts';
import { createRevertActionLogEntry } from '@pages/auction/BidList/actionLogs/cards/revertActionLogEntry';
import { getBidContributorName } from '@utils/slotContributors.utils';
import bidUtils from '@utils/bid.utils.ts';

import type { RootState } from '@reducers/index.ts';
import type {
  ActionLogEntry,
  BidLotChange,
  LotPriceChangedActionLogEntry,
  PurchaseLog,
} from '@pages/auction/BidList/actionLogs/cards/entryTypes';
import type { Purchase } from '@reducers/Purchases/Purchases.ts';

export type {
  ActionLogEntry,
  AuctionClearedActionLogEntry,
  BidDeletedActionLogEntry,
  BidLotChange,
  BidProcessedActionLogEntry,
  BidRedemptionStatusChangedActionLogEntry,
  BidSplitActionLogEntry,
  BidUpdatedActionLogEntry,
  LotAddedActionLogEntry,
  LotDeletedActionLogEntry,
  LotPriceChangedActionLogEntry,
  LotRenamedActionLogEntry,
  LotsReplacedActionLogEntry,
  PurchaseLog,
} from '@pages/auction/BidList/actionLogs/cards/entryTypes';

interface ActionsLogState {
  entries: ActionLogEntry[];
}

const initialState: ActionsLogState = {
  entries: [],
};

const createActionLogId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createActionLogTimestamp = (): string => new Date().toISOString();

export const createActionLogEntry = <Entry extends Omit<ActionLogEntry, 'id' | 'timestamp'>>(
  entry: Entry,
): Entry & Pick<ActionLogEntry, 'id' | 'timestamp'> => ({
  ...entry,
  id: createActionLogId(),
  timestamp: createActionLogTimestamp(),
});

const mapBidLogStatus = (
  entries: ActionLogEntry[],
  bidIds: Set<string>,
  status: PurchaseStatusEnum,
): ActionLogEntry[] =>
  entries.map((entry) => {
    if (entry.type === 'bid.processed' && bidIds.has(entry.bidLog.id)) {
      return { ...entry, bidLog: { ...entry.bidLog, status } };
    }

    if (entry.type === 'bid.split') {
      return {
        ...entry,
        bidLogs: entry.bidLogs.map((bidLog) => (bidIds.has(bidLog.id) ? { ...bidLog, status } : bidLog)),
      };
    }

    if (entry.type === 'bid.deleted' && bidIds.has(entry.bidLog.id)) {
      return { ...entry, bidLog: { ...entry.bidLog, status } };
    }

    return entry;
  });

export const attachActionLogEntry = (action: PayloadAction<unknown>, entry: ActionLogEntry | null): void => {
  if (!entry) {
    return;
  }

  const mutableAction = action as AnyAction;
  mutableAction.meta = {
    ...mutableAction.meta,
    actionLogEntry: entry,
  };
};

const getAttachedActionLogEntry = (action: AnyAction): ActionLogEntry | null => {
  if (action.meta?.skipActionLog) {
    return null;
  }

  return action.meta?.actionLogEntry ?? null;
};

const actionsLogSlice = createSlice({
  name: 'actionsLog',
  initialState,
  reducers: {
    addActionLogEntry(state, action: PayloadAction<ActionLogEntry>): void {
      state.entries = [...state.entries, action.payload];
    },
    updateActionLogEntry(state, action: PayloadAction<ActionLogEntry>): void {
      state.entries = state.entries.map((entry) => (entry.id === action.payload.id ? action.payload : entry));
    },
    setActionLog(state, action: PayloadAction<ActionLogEntry[]>): void {
      state.entries = action.payload;
    },
    clearActionLog(state): void {
      state.entries = [];
    },
    markActionReverted(state, action: PayloadAction<string>): void {
      state.entries = state.entries.filter((entry) => entry.id !== action.payload);
    },
    updatePurchaseLogStatuses(state, action: PayloadAction<{ bidIds: string[]; status: PurchaseStatusEnum }>): void {
      state.entries = mapBidLogStatus(state.entries, new Set(action.payload.bidIds), action.payload.status);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is AnyAction => Boolean(getAttachedActionLogEntry(action as AnyAction)),
      (state, action) => {
        const entry = getAttachedActionLogEntry(action);
        if (entry) {
          state.entries = [...state.entries, entry];
        }
      },
    );
  },
});

export const actionsLogSliceName = actionsLogSlice.name;
export const {
  addActionLogEntry,
  updateActionLogEntry,
  setActionLog,
  clearActionLog,
  markActionReverted,
  updatePurchaseLogStatuses,
} = actionsLogSlice.actions;

const getBidLogsFromEntry = (entry: ActionLogEntry): PurchaseLog[] => {
  if (entry.revertedAt) {
    return [];
  }

  if (entry.type === 'bid.processed' || entry.type === 'bid.deleted') {
    return [entry.bidLog];
  }

  if (entry.type === 'bid.split') {
    return entry.bidLogs;
  }

  return [];
};

export const selectPurchaseLogs = (state: RootState): PurchaseLog[] =>
  state.actionsLog.entries.flatMap(getBidLogsFromEntry);

export const revertActionLogEntry = createRevertActionLogEntry({
  markActionReverted,
  updatePurchaseLogStatuses,
});

export const revertLatestActionLogEntry =
  () =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const entry = [...getState().actionsLog.entries].reverse().find(({ revertedAt }) => !revertedAt);
    if (entry) {
      dispatch(revertActionLogEntry(entry.id));
    }
  };

export const createLotPriceChangedEntry = (
  previousLot: Lot | undefined,
  nextLot: Lot | undefined,
): LotPriceChangedActionLogEntry | null => {
  if (!previousLot || !nextLot) {
    return null;
  }

  const previousAmount = previousLot.amount ?? null;
  const nextAmount = nextLot.amount ?? null;
  const amountDelta = Number(nextAmount ?? 0) - Number(previousAmount ?? 0);

  if (amountDelta === 0) {
    return null;
  }

  return createActionLogEntry({
    type: 'lot.priceChanged',
    lotId: nextLot.id,
    lotName: nextLot.name,
    previousAmount,
    nextAmount,
    amountDelta,
  });
};

export const buildBidLotChange = (lot: Lot, amountDelta: number, bid: Purchase, wasCreated = false): BidLotChange => ({
  lotId: lot.id,
  lotName: lot.name,
  amountDelta,
  contributorName: getBidContributorName(bid),
  contributorDelta: amountDelta,
  wasCreated,
  aliasKey: bidUtils.getName(bid),
});

export const createPurchaseLog = (
  bid: Purchase,
  getState: () => RootState,
  target: string,
  newLot: boolean,
  overrides: Partial<PurchaseLog> = {},
): PurchaseLog => {
  const cost = bidUtils.parseCost(bid, getState().aucSettings.settings, newLot);

  return {
    ...bid,
    timestamp: createActionLogTimestamp(),
    cost: overrides.cost ?? cost,
    rawCost: overrides.rawCost ?? bid.cost,
    status: overrides.status ?? PurchaseStatusEnum.Processed,
    target,
    ...overrides,
  };
};

export const logBidProcessed =
  (bid: Purchase, lot: Lot, amount: number, newLot: boolean) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const bidLog = createPurchaseLog(bid, getState, lot.id, newLot);

    dispatch(
      addActionLogEntry(
        createActionLogEntry({
          type: 'bid.processed',
          bidLog,
          pendingBid: bid,
          lotChanges: [buildBidLotChange(lot, amount, bid, newLot)],
        }),
      ),
    );
  };

export const logBidDeleted =
  (bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
    const bidLog: PurchaseLog = {
      ...bid,
      timestamp: createActionLogTimestamp(),
      status: PurchaseStatusEnum.Deleted,
      rawCost: bid.cost,
    };

    dispatch(
      addActionLogEntry(
        createActionLogEntry({
          type: 'bid.deleted',
          bidLog,
          pendingBid: bid,
        }),
      ),
    );
  };

export default actionsLogSlice.reducer;
