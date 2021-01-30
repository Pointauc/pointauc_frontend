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
  const {
    slots: { slots },
  } = getState();
  const { cost, username, message, isDonation } = redemption;
  const similarSlotId = slotNamesMap.get(message);
  const similarSlot = slots.find(({ id }) => id === similarSlotId);

  if (similarSlot && !isDonation) {
    const { id, amount, name } = similarSlot;
    const alertMessage = `${username} добавил ${cost} к "${name}" ("${message}")!`;

    dispatch(setSlotAmount({ id, amount: Number(amount) + cost }));
    dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: id.toString() }));
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
  } else {
    dispatch(addPurchase(redemption));
  }
};

export default purchasesSlice.reducer;
