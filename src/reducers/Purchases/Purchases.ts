import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';

import { AlertTypeEnum } from '@models/alert.model.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import bidUtils from '@utils/bid.utils.ts';
import slotNamesMap, { SlotNamesMap } from '@services/SlotNamesMap';

import { RootState } from '../index';
import { addBid, createSlotFromPurchase } from '../Slots/Slots';
import { addAlert } from '../notifications/notifications';

export interface Purchase {
  timestamp: string;
  cost: number;
  username: string;
  message: string;
  color: string;
  id: string;
  rewardId?: string;
  isDonation?: boolean;
  investorId?: string;
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
  purchases: [
    // {
    //   username: 'name',
    //   message: 'message 1',
    //   timestamp: new Date().toISOString(),
    //   cost: 100,
    //   color: '#469291',
    //   id: '1234',
    // },
  ],
  history: [],
  draggedRedemption: null,
};

export const addedBidsMap = new SlotNamesMap();

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
  (bidLog: PurchaseLog, newLot: boolean = false) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const cost = bidUtils.parseCost(bidLog, getState().aucSettings.settings, newLot);

    dispatch(addPurchaseLog({ ...bidLog, timestamp: new Date().toISOString(), cost }));
    if (bidLog.target) {
      addedBidsMap.set(bidLog.id, bidLog.target);
    }
  };

export const fastAddBid =
  (bid: Purchase, slotId: string) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const showAlert = (cost: number): void => {
      const { username, message } = bid;
      const alertMessage = `${username} добавил ${cost} к "${name}" ("${message}")!`;
      dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
    };

    dispatch(addBid(slotId, bid, { removeBid: false, callback: showAlert }));
  };

export const processRedemption =
  (redemption: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: {
        settings: { luckyWheelEnabled, alwaysAddNew },
      },
    } = getState();
    const similarSlotId = slotNamesMap.get(redemption.message);

    if (similarSlotId && !luckyWheelEnabled) {
      dispatch(fastAddBid(redemption, similarSlotId));
    } else if (alwaysAddNew) {
      dispatch(createSlotFromPurchase(redemption));
    } else {
      dispatch(addPurchase(redemption));
    }
  };

export const updateExistBids = (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
  const {
    purchases: { purchases },
    aucSettings: {
      settings: { luckyWheelEnabled },
    },
  } = getState();

  purchases.forEach((bid) => {
    const similarSlotId = slotNamesMap.get(bid.message);

    if (similarSlotId && !luckyWheelEnabled) {
      dispatch(fastAddBid(bid, similarSlotId));
      dispatch(removePurchase(bid.id));
    }
  });
};

export default purchasesSlice.reducer;
