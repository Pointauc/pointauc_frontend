import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { getSlotPosition, normalizePurchase } from '../../utils/slots.utils';
import { RootState } from '../index';
import { setSlotAmount } from '../Slots/Slots';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import slotNamesMap from '../../services/SlotNamesMap';

export enum PurchaseStatusEnum {
  Processed = 'Processed',
  Deleted = 'Deleted',
}

export interface Bid {
  timestamp: string;
  cost: number;
  username: string;
  message: string;
  color: string;
  id: string;
  rewardId?: string;
  isDonation?: boolean;
}

export interface RelatedBid extends Bid {
  index?: number;
}

export interface BidLog extends Bid {
  status: PurchaseStatusEnum;
  target?: string;
}

interface PurchasesState {
  purchases: Bid[];
  history: BidLog[];
  draggedRedemption: string | null;
}

const initialState: PurchasesState = {
  purchases: [],
  history: [],
  draggedRedemption: null,
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    logPurchase(state, action: PayloadAction<BidLog>): void {
      state.history = [...state.history, action.payload];
    },
    addPurchase(state, action: PayloadAction<Bid>): void {
      state.purchases = [...state.purchases, normalizePurchase(action.payload)];
    },
    removePurchase(state, action: PayloadAction<ReactText>): void {
      state.purchases = state.purchases.filter(({ id }) => id !== action.payload);
    },
    resetPurchases(state): void {
      state.purchases = [];
    },
    setDraggedRedemption(state, action: PayloadAction<string | null>): void {
      state.draggedRedemption = action.payload;
    },
  },
});

export const {
  addPurchase,
  removePurchase,
  logPurchase,
  resetPurchases,
  setDraggedRedemption,
} = purchasesSlice.actions;

export const fastAddBid = (bid: RelatedBid, slotId: string) => (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  getState: () => RootState,
): void => {
  const {
    slots: { slots },
  } = getState();
  const { cost, username, message, isDonation } = bid;
  const { arrayIndex, listIndex } = getSlotPosition(slots, slotId);

  if (listIndex > -1 && !isDonation) {
    const { id, amount, name } = slots[listIndex][arrayIndex];
    const alertMessage = `${username} добавил ${cost} к "${name}" ("${message}")!`;

    dispatch(setSlotAmount({ id, amount: Number(amount) + cost }));
    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: id.toString() }));
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
  }
};

export const processRedemption = (redemption: Bid) => (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
  const { message } = redemption;
  const similarSlotId = slotNamesMap.get(message);

  if (similarSlotId) {
    dispatch(fastAddBid(redemption, similarSlotId));
  } else {
    dispatch(addPurchase(redemption));
  }
};

export const updateExistBids = (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
  const {
    purchases: { purchases },
  } = getState();

  purchases.forEach((bid) => {
    const similarSlotId = slotNamesMap.get(bid.message);

    if (similarSlotId) {
      dispatch(fastAddBid(bid, similarSlotId));
      dispatch(removePurchase(bid.id));
    }
  });
};

export default purchasesSlice.reducer;
