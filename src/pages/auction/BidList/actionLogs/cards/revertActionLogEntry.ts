import { PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action, AnyAction } from 'redux';

import { Lot, LotContributor } from '@models/slot.model.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { RootState } from '@reducers/index.ts';

import { ACTION_LOG_TRACKED_ACTION_TYPES } from './actionLogActionTypes';
import { ActionLogEntry, BidLotChange } from './entryTypes';

import type { Purchase } from '@reducers/Purchases/Purchases.ts';

type MarkActionRevertedActionCreator = (entryId: string) => PayloadAction<string>;
type UpdatePurchaseLogStatusesActionCreator = (payload: {
  bidIds: string[];
  status: PurchaseStatusEnum;
}) => PayloadAction<{ bidIds: string[]; status: PurchaseStatusEnum }>;

interface RevertActionLogEntryOptions {
  markActionReverted: MarkActionRevertedActionCreator;
  updatePurchaseLogStatuses: UpdatePurchaseLogStatusesActionCreator;
}

const dispatchWithoutActionLog = (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  actionType: string,
  payload?: unknown,
): void => {
  dispatch({
    type: actionType,
    payload,
    meta: { skipActionLog: true },
  } as AnyAction);
};

const subtractContributorAmount = (
  contributors: LotContributor[] | undefined,
  contributorName: string | null,
  amount: number,
): LotContributor[] | undefined => {
  if (!contributorName) {
    return contributors;
  }

  return (contributors ?? [])
    .map((contributor) =>
      contributor.name === contributorName ? { ...contributor, amount: contributor.amount - amount } : contributor,
    )
    .filter((contributor) => Math.abs(contributor.amount) > 0.0001);
};

const restorePendingBid = (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  getState: () => RootState,
  bid: Purchase,
): void => {
  const hasBid = getState().purchases.purchases.some((purchase) => purchase.id === bid.id);
  if (!hasBid) {
    dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.addPurchase, bid);
  }
};

const revertBidLotChanges = (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  getState: () => RootState,
  lotChanges: BidLotChange[],
): void => {
  lotChanges.forEach((change) => {
    const lot = getState().slots.slots.find(({ id }) => id === change.lotId);
    if (!lot) {
      return;
    }

    const nextLot: Partial<Lot> = {
      id: change.lotId,
      amount: Number(lot.amount ?? 0) - change.amountDelta,
      contributors: subtractContributorAmount(lot.contributors, change.contributorName, change.contributorDelta),
    };

    if (nextLot.amount === 0) {
      dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.deleteSlot, change.lotId);
      return;
    }

    dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setSlotData, nextLot);
  });
};

const restoreDeletedLot = (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  getState: () => RootState,
  lot: Lot,
): void => {
  if (getState().slots.slots.some(({ id }) => id === lot.id)) {
    return;
  }

  dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.addSlot, lot);
};

export const createRevertActionLogEntry =
  ({ markActionReverted, updatePurchaseLogStatuses }: RevertActionLogEntryOptions) =>
  (entryId: string) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const entry = getState().actionsLog.entries.find(({ id }) => id === entryId);
    if (!entry || entry.revertedAt) {
      return;
    }

    switch (entry.type) {
      case 'lot.renamed':
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setSlotName, {
          id: entry.lotId,
          name: entry.previousName ?? '',
          ignoreParsing: true,
        });
        break;
      case 'lot.priceChanged': {
        const lot = getState().slots.slots.find(({ id }) => id === entry.lotId);
        if (lot && entry.changeValueType === 'percentage') {
          if (entry.previousAmount == null) {
            dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.unlockPercentage, entry.lotId);
          } else {
            dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setLockedPercentage, {
              id: entry.lotId,
              percentage: entry.previousAmount,
            });
          }
        } else if (lot) {
          dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setSlotAmount, {
            id: entry.lotId,
            amount: Number(lot.amount ?? 0) - entry.amountDelta,
          });
        }
        break;
      }
      case 'lot.added':
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.deleteSlot, entry.lot.id);
        break;
      case 'lot.deleted':
        restoreDeletedLot(dispatch, getState, entry.lot);
        break;
      case 'lots.replaced':
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setSlots, entry.previousLots);
        break;
      case 'auction.cleared':
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setSlots, entry.previousLots);
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.setPurchases, entry.previousPurchases);
        break;
      case 'bid.processed':
        revertBidLotChanges(dispatch, getState, entry.lotChanges);
        restorePendingBid(dispatch, getState, entry.pendingBid);
        break;
      case 'bid.split':
        revertBidLotChanges(dispatch, getState, entry.lotChanges);
        restorePendingBid(dispatch, getState, entry.pendingBid);
        break;
      case 'bid.deleted':
        restorePendingBid(dispatch, getState, entry.pendingBid);
        break;
      case 'bid.updated':
        dispatchWithoutActionLog(dispatch, ACTION_LOG_TRACKED_ACTION_TYPES.updateBid, entry.previousBid);
        break;
      case 'bid.redemptionStatusChanged':
        dispatch(
          updatePurchaseLogStatuses({
            bidIds: entry.bidIds,
            status: entry.previousStatus,
          }),
        );
        break;
      default:
        break;
    }

    dispatch(markActionReverted(entry.id));
  };
