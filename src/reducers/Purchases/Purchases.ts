import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { normalizePurchase } from '../../utils/slots.utils';
import { RootState } from '../index';
import { createSlotFromPurchase, setSlotAmount } from '../Slots/Slots';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import slotNamesMap from '../../services/SlotNamesMap';
import { PurchaseStatusEnum } from '../../models/purchase';

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
  draggedRedemption: Purchase | null;
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
    addPurchaseLog(state, action: PayloadAction<PurchaseLog>): void {
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
    setDraggedRedemption(state, action: PayloadAction<Purchase | null>): void {
      state.draggedRedemption = action.payload;
    },
    updateBid(state, action: PayloadAction<Purchase>): void {
      const index = state.purchases.findIndex(({ id }) => id === action.payload?.id);

      if (index !== -1) {
        state.purchases[index] = action.payload;
      }
    },
  },
});

export const { addPurchase, removePurchase, addPurchaseLog, resetPurchases, setDraggedRedemption, updateBid } =
  purchasesSlice.actions;

export const logPurchase =
  (bid: PurchaseLog) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const { pointsRate } = getState().aucSettings.integration.da;
    const { cost, isDonation } = bid;

    dispatch(
      addPurchaseLog({ ...bid, timestamp: new Date().toISOString(), cost: isDonation ? cost * pointsRate : cost }),
    );
  };

export const fastAddBid =
  (bid: Purchase, slotId: string) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
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

export const processRedemption =
  (redemption: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: {
        settings: { marbleRate = 1, marblesAuc, marbleCategory },
        integration: {
          twitch: { alwaysAddNew },
        },
      },
    } = getState();
    const normalizedBid = normalizePurchase(redemption);
    const similarSlotId = slotNamesMap.get(normalizedBid.message);
    const convertToMarble = (cost: number): number => {
      const minValue = marbleCategory || 0;

      if (cost < minValue) {
        return 0;
      }
      const total = cost - minValue;

      return Math.floor(total / marbleRate) + 1;
    };
    const convertCost = (cost: number): number => (marblesAuc ? convertToMarble(cost) : cost);
    const cost = convertCost(normalizedBid.cost);

    if (similarSlotId) {
      dispatch(fastAddBid(normalizedBid, similarSlotId));
    } else if (alwaysAddNew) {
      dispatch(createSlotFromPurchase({ ...normalizedBid, cost }));
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
