import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { normalizePurchase } from '../../utils/slots.utils';
import { RootState } from '../index';
import { setSlotAmount } from '../Slots/Slots';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';

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
  id: ReactText;
  rewardId?: string;
  isDonation?: boolean;
}

export interface PurchaseLog {
  purchase: Purchase;
  status: PurchaseStatusEnum;
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

export const processRedemption = (redemption: Purchase) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { slots } = getState().slots;
  const { cost, username, message, isDonation } = redemption;
  const comparedSlot = slots.find(({ name }) => name && !name.localeCompare(message, 'en', { sensitivity: 'accent' }));

  if (comparedSlot && !isDonation) {
    const { id, amount, name } = comparedSlot;

    dispatch(setSlotAmount({ id, amount: Number(amount) + cost }));
    dispatch(logPurchase({ purchase: redemption, status: PurchaseStatusEnum.Processed }));
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: `${username} добавил ${cost} к "${name}"!` }));
  } else {
    dispatch(addPurchase(redemption));
  }
};

export default purchasesSlice.reducer;
