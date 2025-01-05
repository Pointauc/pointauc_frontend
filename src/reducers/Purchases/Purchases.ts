import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';

import { AlertTypeEnum } from '@models/alert.model.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import bidUtils from '@utils/bid.utils.ts';
import slotNamesMap, { SlotNamesMap } from '@services/SlotNamesMap';
import { InsertStrategy } from '@enums/settings.enum.ts';

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
  source: Bid.Source;
  rewardId?: string;
  isDonation?: boolean;
  investorId?: string;
  insertStrategy?: InsertStrategy;
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
    setHistory(state, action: PayloadAction<PurchaseLog[]>): void {
      state.history = action.payload;
    },
    addPurchase(state, action: PayloadAction<Purchase>): void {
      state.purchases = [...state.purchases, action.payload];
    },
    removePurchase(state, action: PayloadAction<ReactText>): void {
      state.purchases = state.purchases.filter(({ id }) => id !== action.payload);
    },
    setPurchases(state, action: PayloadAction<Purchase[]>): void {
      state.purchases = action.payload;
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

export const {
  addPurchase,
  setHistory,
  removePurchase,
  addPurchaseLog,
  resetPurchases,
  setDraggedRedemption,
  updateBid,
  setPurchases,
} = purchasesSlice.actions;

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
  (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
    const showAlert = (cost: number): void => {
      const { username, message } = bid;
      const alertMessage = `${username} добавил ${bidUtils.getDisplayCost(cost)} к "${name}" ("${message}")!`;
      dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
    };

    dispatch(addBid(slotId, bid, { removeBid: false, callback: showAlert }));
  };

export const processRedemption =
  (bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: { settings },
    } = getState();
    const insertStrategy =
      !bid.insertStrategy || bid.insertStrategy === InsertStrategy.Auto ? settings.insertStrategy : bid.insertStrategy;

    if (insertStrategy === InsertStrategy.None || settings.luckyWheelEnabled) {
      dispatch(addPurchase(bid));
      return;
    }

    const similarSlotId = slotNamesMap.get(bid.message);
    if (similarSlotId) {
      dispatch(fastAddBid(bid, similarSlotId));
      return;
    }

    if (insertStrategy === InsertStrategy.Match) {
      dispatch(addPurchase(bid));
      return;
    }

    dispatch(createSlotFromPurchase(bid));
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
