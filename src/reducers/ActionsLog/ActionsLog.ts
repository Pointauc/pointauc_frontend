import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action, AnyAction, Middleware } from 'redux';

import { PurchaseStatusEnum } from '@models/purchase.ts';
import { Lot } from '@models/slot.model.ts';
import { ACTION_LOG_TRACKED_ACTION_TYPES } from '@pages/auction/BidList/actionLogs/cards/actionLogActionTypes';
import { createRevertActionLogEntry } from '@pages/auction/BidList/actionLogs/cards/revertActionLogEntry';
import { RootState } from '@reducers/index.ts';
import { getBidContributorName } from '@utils/slotContributors.utils';
import bidUtils from '@utils/bid.utils.ts';

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

const getLotById = (state: RootState, lotId: string | number): Lot | undefined =>
  state.slots.slots.find(({ id }) => id === lotId);

const createLotPriceChangedEntry = (
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

interface ActionLogHandlerContext {
  action: AnyAction;
  nextState: RootState;
  previousState: RootState;
}

type ActionLogHandler = (context: ActionLogHandlerContext) => ActionLogEntry | null;

const getLotIdFromSlotPayload = (payload: string | { id: string | number }): string | number =>
  typeof payload === 'string' ? payload : payload.id;

const createLotNameChangedEntry: ActionLogHandler = ({ action, previousState, nextState }) => {
  if (action.payload?.ignoreParsing) {
    return null;
  }

  const previousLot = getLotById(previousState, action.payload.id);
  const nextLot = getLotById(nextState, action.payload.id);

  if (!previousLot || !nextLot || previousLot.name === nextLot.name) {
    return null;
  }

  return createActionLogEntry({
    type: 'lot.renamed',
    lotId: nextLot.id,
    previousName: previousLot.name,
    nextName: nextLot.name,
  });
};

const createLotAmountChangedEntry: ActionLogHandler = ({ action, previousState, nextState }) => {
  const previousLot = getLotById(previousState, action.payload.id);
  const nextLot = getLotById(nextState, action.payload.id);

  return createLotPriceChangedEntry(previousLot, nextLot);
};

const createLotAddedEntry: ActionLogHandler = ({ previousState, nextState }) => {
  const previousIds = new Set(previousState.slots.slots.map(({ id }) => id));
  const lot = nextState.slots.slots.find(({ id }) => !previousIds.has(id));

  return lot ? createActionLogEntry({ type: 'lot.added', lot }) : null;
};

const createLotDeletedEntry: ActionLogHandler = ({ action, previousState }) => {
  const lot = previousState.slots.slots.find(({ id }) => id === action.payload);

  return lot ? createActionLogEntry({ type: 'lot.deleted', lot }) : null;
};

const createLotPercentageChangedEntry: ActionLogHandler = ({ action, previousState, nextState }) => {
  const lotId = getLotIdFromSlotPayload(action.payload);
  const previousLot = getLotById(previousState, lotId);
  const nextLot = getLotById(nextState, lotId);

  if (!previousLot || !nextLot || previousLot.lockedPercentage === nextLot.lockedPercentage) {
    return null;
  }

  return createActionLogEntry({
    type: 'lot.priceChanged',
    lotId: nextLot.id,
    lotName: nextLot.name,
    previousAmount: previousLot.lockedPercentage ?? null,
    nextAmount: nextLot.lockedPercentage ?? null,
    amountDelta: Number(nextLot.lockedPercentage ?? 0) - Number(previousLot.lockedPercentage ?? 0),
    changeValueType: 'percentage' as const,
  });
};

const createBidUpdatedEntry: ActionLogHandler = ({ action, previousState }) => {
  const previousBid = previousState.purchases.purchases.find(({ id }) => id === action.payload.id);
  if (!previousBid || previousBid.cost === action.payload.cost) {
    return null;
  }

  return createActionLogEntry({
    type: 'bid.updated',
    previousBid,
    nextBid: action.payload,
  });
};

const actionLogHandlers: Partial<Record<string, ActionLogHandler>> = {
  [ACTION_LOG_TRACKED_ACTION_TYPES.setSlotName]: createLotNameChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.setSlotAmount]: createLotAmountChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.addSlotAmount]: createLotAmountChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.addSlot]: createLotAddedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.deleteSlot]: createLotDeletedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.setLockedPercentage]: createLotPercentageChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.unlockPercentage]: createLotPercentageChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.setLotPercentage]: createLotPercentageChangedEntry,
  [ACTION_LOG_TRACKED_ACTION_TYPES.updateBid]: createBidUpdatedEntry,
};

export const createActionsLogMiddleware = (): Middleware<{}, RootState> => (storeApi) => (next) => (action) => {
  const typedAction = action as AnyAction;

  if (typedAction.meta?.skipActionLog || typedAction.type.startsWith(`${actionsLogSlice.name}/`)) {
    return next(action);
  }

  const handler = actionLogHandlers[typedAction.type];
  if (!handler) {
    return next(action);
  }

  const previousState = storeApi.getState();
  const result = next(action);
  const nextState = storeApi.getState();
  const entry = handler({ action: typedAction, nextState, previousState });

  if (entry) {
    storeApi.dispatch(addActionLogEntry(entry));
  }

  return result;
};

export const buildBidLotChange = (lot: Lot, amountDelta: number, bid: Purchase, wasCreated = false): BidLotChange => ({
  lotId: lot.id,
  lotName: lot.name,
  amountDelta,
  contributorName: getBidContributorName(bid),
  contributorDelta: amountDelta,
  wasCreated,
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
