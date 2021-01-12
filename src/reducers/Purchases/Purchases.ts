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
  rewardId: string;
}

export interface PurchaseLog {
  purchase: Purchase;
  status: PurchaseStatusEnum;
}

interface PurchasesState {
  purchases: Purchase[];
  history: PurchaseLog[];
}

const initialState: PurchasesState = {
  purchases: [],
  history: [],
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
  },
});

export const { addPurchase, removePurchase, logPurchase, resetPurchases } = purchasesSlice.actions;

export const processRedemption = (redemption: Purchase) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const { slots } = getState().slots;
  const comparedSlot = slots.find(
    ({ name }) => name && !name.localeCompare(redemption.message, 'en', { sensitivity: 'accent' }),
  );

  if (comparedSlot) {
    const { id, amount, name } = comparedSlot;
    const { cost, username } = redemption;

    dispatch(setSlotAmount({ id, amount: Number(amount) + redemption.cost }));
    dispatch(logPurchase({ purchase: redemption, status: PurchaseStatusEnum.Processed }));
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: `${username} добавил ${cost} к "${name}"!` }));
  } else {
    dispatch(addPurchase(redemption));
  }
};

export default purchasesSlice.reducer;
