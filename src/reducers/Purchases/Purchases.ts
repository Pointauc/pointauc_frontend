import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { normalizePurchase } from '../../utils/slots.utils';
import { RootState } from '../index';
import { setSlotAmount } from '../Slots/Slots';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import slotNamesMap from '../../services/SlotNamesMap';

export enum PurchaseStatusEnum {
  Processed = 'Processed',
  Deleted = 'Deleted',
}

export interface Purchase {
  timestamp: string;
  cost: number;
  username: string;
  message: string;
  color: string;
  id: string;
  rewardId?: string;
  isDonation?: boolean;
}

export interface PurchaseLog extends Purchase {
  status: PurchaseStatusEnum;
  target?: string;
}

interface PurchasesState {
  purchases: Purchase[];
  history: PurchaseLog[];
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
    logPurchase(state, action: PayloadAction<PurchaseLog>): void {
      state.history = [...state.history, action.payload];
    },
    addPurchase(state, action: PayloadAction<Purchase>): void {
      state.purchases = [...state.purchases, action.payload];
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

export const fastAddBid = (bid: Purchase, slotId: string) => (
  dispatch: ThunkDispatch<RootState, {}, Action>,
  getState: () => RootState,
): void => {
  const {
    slots: { slots },
    aucSettings: {
      settings: { marbleRate = 1, marblesAuc },
      integration: {
        da: { pointsRate },
      },
    },
  } = getState();

  const convertToMarble = (cost: number): number => Math.floor(cost / marbleRate);

  const convertCost = (cost: number): number => (marblesAuc ? convertToMarble(cost) : cost);

  const { cost: rawCost, username, message } = bid;
  const similarSlot = slots.find(({ id }) => id === slotId);

  if (similarSlot) {
    const { id, amount, name } = similarSlot;
    const addedCost = bid.isDonation ? rawCost * pointsRate : rawCost;
    const cost = convertCost(addedCost);
    const alertMessage = `${username} добавил ${cost} к "${name}" ("${message}")!`;

    dispatch(setSlotAmount({ id, amount: Number(amount) + cost }));
    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: id.toString(), cost }));
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
  }
};

export const processRedemption = (redemption: Purchase) => (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
  const normalizedBid = normalizePurchase(redemption);
  const similarSlotId = slotNamesMap.get(normalizedBid.message);

  if (similarSlotId) {
    dispatch(fastAddBid(normalizedBid, similarSlotId));
  } else {
    dispatch(addPurchase(normalizedBid));
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
