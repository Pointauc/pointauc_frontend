import { notifications } from '@mantine/notifications';
import { createSlice, current, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';

import { InsertStrategy } from '@enums/insertStrategy.enum';
import { Lot } from '@models/slot.model.ts';
import { attachActionLogEntry, createActionLogEntry } from '@reducers/ActionsLog/ActionsLog.ts';
import slotNamesMap, { SlotNamesMap } from '@services/SlotNamesMap';
import bidUtils from '@utils/bid.utils.ts';

import { RootState } from '../index';
import { addBid, createSlotFromPurchase } from '../Slots/Slots';

export interface Purchase {
  timestamp: string;
  cost: number;
  username: string;
  message?: string;
  color: string;
  id: string;
  source: Bid.Source;
  rewardId?: string;
  isDonation?: boolean;
  investorId?: string;
  insertStrategy?: InsertStrategy;
}

interface PurchasesState {
  purchases: Purchase[];
  draggedRedemption: Purchase | null;
}

const initialState: PurchasesState = {
  purchases: [],
  draggedRedemption: null,
};

export const addedBidsMap = new SlotNamesMap();

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    addPurchase(state, action: PayloadAction<Purchase>): void {
      state.purchases = [...state.purchases, action.payload];
    },
    removePurchase(state, action: PayloadAction<string | number>): void {
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
        const previousBid = current(state.purchases[index]);
        state.purchases[index] = action.payload;

        if (previousBid.cost !== action.payload.cost) {
          attachActionLogEntry(
            action,
            createActionLogEntry({
              type: 'bid.updated',
              previousBid,
              nextBid: action.payload,
            }),
          );
        }
      }
    },
  },
});

export { purchasesSlice };

export const { addPurchase, removePurchase, resetPurchases, setDraggedRedemption, updateBid, setPurchases } =
  purchasesSlice.actions;

const visibleNotifications: string[] = [];

export const fastAddBid =
  (bid: Purchase, slotId: string | Lot) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
    const showAlert = (cost: number): void => {
      const name = bidUtils.getName(bid);
      const alertMessage = `${bid.username} добавил ${bidUtils.getDisplayCost(cost)} к "${name}" ("${name}")!`;

      if (visibleNotifications.length >= 4) {
        const id = visibleNotifications.shift();
        if (id) {
          notifications.hide(id);
        }
      }

      notifications.show({
        id: bid.id,
        message: alertMessage,
        color: 'green',
        position: 'bottom-left',
        autoClose: 2000,
        onClose: () => {
          if (visibleNotifications.includes(bid.id)) {
            visibleNotifications.shift();
          }
        },
        onOpen: () => {
          visibleNotifications.push(bid.id);
        },
      });
    };

    dispatch(addBid(slotId, bid, { removeBid: false, callback: showAlert }));
  };

const findSimilarLot = (slotName: string, lots: Lot[]): Lot | undefined => {
  const similarSlotId = slotNamesMap.get(slotName);
  const similarLot = lots.find(({ id }) => id === similarSlotId);
  if (similarLot && !similarLot.lockedPercentage) {
    return similarLot;
  }
  return undefined;
};

export const processRedemption =
  (bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const state = getState();
    const {
      aucSettings: { settings },
      purchases: { purchases },
    } = state;
    // const hasHandledBid = purchases.some(({ id }) => id === bid.id) || Boolean(addedBidsMap.get(bid.id));

    // if (hasHandledBid) {
    //   return;
    // }

    const insertStrategy =
      !bid.insertStrategy || bid.insertStrategy === InsertStrategy.Auto ? settings.insertStrategy : bid.insertStrategy;

    if (insertStrategy === InsertStrategy.None || settings.luckyWheelEnabled) {
      dispatch(addPurchase(bid));
      return;
    }

    const slotName = bidUtils.getName(bid);
    const similarSlot = findSimilarLot(slotName, state.slots.slots);

    if (similarSlot) {
      dispatch(fastAddBid(bid, similarSlot));
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
    const similarSlot = findSimilarLot(bidUtils.getName(bid), getState().slots.slots);

    if (similarSlot && !luckyWheelEnabled) {
      dispatch(fastAddBid(bid, similarSlot));
      dispatch(removePurchase(bid.id));
    }
  });
};

export default purchasesSlice.reducer;
