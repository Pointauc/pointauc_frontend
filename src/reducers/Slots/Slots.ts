import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';

import { PurchaseStatusEnum } from '@models/purchase.ts';
import { Lot } from '@models/slot.model.ts';
import fastIdAllocator from '@services/FastIdAllocator.ts';
import bidUtils from '@utils/bid.utils.ts';
import { getRandomIntInclusive, sortSlots } from '@utils/common.utils.ts';
import { recalculateAllLockedSlots } from '@utils/lockedPercentage.utils';
import {
  addContributorAmount,
  contributorsFromLegacyInvestors,
  getBidContributorName,
} from '@utils/slotContributors.utils';

import slotNamesMap from '../../services/SlotNamesMap';
import { addedBidsMap, logPurchase, Purchase, removePurchase } from '../Purchases/Purchases';
import { RootState } from '../index';

import LotQuery = PublicApi.LotQuery;

interface SlotsState {
  slots: Lot[];
  searchTerm: string;
  isInitialized: boolean;
}

export const createSlot = (props: Partial<Lot> = {}): Lot => {
  const { fastId, ...rest } = props;
  const slot = {
    fastId: fastIdAllocator.allocate(fastId),
    id: Math.random().toString(),
    amount: null,
    name: '',
    contributors: [],
    lockedPercentage: null,
    isFavorite: false,
    ...rest,
  };

  slotNamesMap.updateSlot(slot);

  return slot;
};

export const createRandomSlots = (count: number, max: number, min = 1): Lot[] =>
  sortSlots(
    Array(count)
      .fill(null)
      .map(() => {
        const amount = getRandomIntInclusive(min, max);

        return createSlot({ amount, name: amount.toString() });
      }),
  );

export const updateFastIdCounter = (slots: Lot[]): void => {
  fastIdAllocator.setFromList(slots);
};

export const initialSlots = [createSlot()];
updateFastIdCounter(initialSlots);
slotNamesMap.setFromList(initialSlots);

const initialState: SlotsState = {
  searchTerm: '',
  slots: initialSlots,
  isInitialized: false,
};

const updateSlotPosition = (slots: Lot[], index: number): void => {
  if (Number(slots[index].amount) >= Number(slots[0].amount)) {
    slots.unshift(slots.splice(index, 1)[0]);
  }
};

const updateSlotAmount = (slots: Lot[], updatedId: string | number, transform: (slot: Lot) => Lot): void => {
  const updatedIndex = slots.findIndex(({ id }) => updatedId === id);
  if (updatedIndex === -1) {
    return;
  }

  slots[updatedIndex] = transform(slots[updatedIndex]);
  updateSlotPosition(slots, updatedIndex);
};

const updateSlotIsFavorite = (slots: Lot[], slotId: string | number, state: boolean) => {
  const index = slots.findIndex(({ id }) => slotId === id);

  if (index === -1) {
    return;
  }

  slots[index].isFavorite = state;
};

type TestLot = (lot: Lot) => boolean;

const slotsQueryComparator = {
  id: (lot: Lot, id: string) => lot.id === id,
  investorId: (lot: Lot, investorId: string) => lot.contributors?.some(({ name }) => name === investorId) ?? false,
  bidId: (lot: Lot, bidId: string) => lot.id === addedBidsMap.get(bidId),
};

export const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    setSlotData(state, action: PayloadAction<Partial<Lot>>): void {
      const { id, ...rest } = action.payload;
      // ToDo: check if the name has been changed

      state.slots = state.slots.map((slot) => {
        if (slot.id !== id) {
          return slot;
        }

        const updatedSlot = { ...slot, ...rest };
        if ((rest.name != null && rest.name !== slot.name) || (rest.fastId != null && rest.fastId !== slot.fastId)) {
          slotNamesMap.updateSlot(updatedSlot);
        }

        return updatedSlot;
      });
    },
    setSlotName(state, action: PayloadAction<{ id: string; name: string; ignoreParsing?: boolean }>): void {
      const { id, name } = action.payload;
      state.slots = state.slots.map((slot) => {
        if (slot.id === id && slot.name != null) {
          const updatedSlot = { ...slot, name };
          slotNamesMap.updateSlot(updatedSlot);

          return updatedSlot;
        }

        return slot;
      });
    },
    addSlotAmount(state, action: PayloadAction<{ id: string | number; amount: number }>): void {
      const { id, amount } = action.payload;
      updateSlotAmount(state.slots, id, (slot) => ({ ...slot, amount: (slot.amount || 0) + amount }));
    },
    setSlotAmount(state, action: PayloadAction<{ id: string | number; amount: number }>): void {
      const { id, amount } = action.payload;
      updateSlotAmount(state.slots, id, (slot) => ({ ...slot, amount }));
    },
    setLotPercentage(state, action: PayloadAction<{ id: string | number; percentage: number }>): void {
      const { id, percentage } = action.payload;
      state.slots = sortSlots(recalculateAllLockedSlots(state.slots, { id, percentage }));
    },
    setSlotIsFavorite(state, action: PayloadAction<{ id: string | number; state: boolean }>): void {
      const { id, state: favoriteState } = action.payload;
      updateSlotIsFavorite(state.slots, id, favoriteState);
    },
    deleteSlot(state, action: PayloadAction<string>): void {
      const deletedId = action.payload;
      const deletedSlot = state.slots.find(({ id }) => deletedId === id);

      slotNamesMap.deleteBySlotId(deletedId);
      if (deletedSlot) {
        fastIdAllocator.release(deletedSlot.fastId);
      }

      if (state.slots.length === 1) {
        state.slots = [createSlot()];
      } else {
        state.slots = state.slots.filter(({ id }) => deletedId !== id);
      }
    },
    addSlot(state, action: PayloadAction<Partial<Lot>>): void {
      const newSlot = createSlot(action?.payload);
      state.slots = [...state.slots, newSlot];
    },
    resetSlots(state): void {
      slotNamesMap.clear();
      addedBidsMap.clear();
      fastIdAllocator.reset();
      state.slots = [createSlot({ fastId: 1 })];
      updateFastIdCounter(state.slots);
    },
    setSlots(state, action: PayloadAction<Lot[]>): void {
      state.slots = action.payload;
      updateFastIdCounter(state.slots);
      slotNamesMap.setFromList(state.slots);
    },
    reorderSlots(state, action: PayloadAction<Lot[]>): void {
      state.slots = action.payload;
    },
    setSlotsInitialized(state): void {
      state.isInitialized = true;
    },
    setSearchTerm(state, action: PayloadAction<string>): void {
      state.searchTerm = action.payload;
    },
    setLockedPercentage(state, action: PayloadAction<{ id: string; percentage: number }>): void {
      const { id, percentage } = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, lockedPercentage: percentage } : slot));
    },
    unlockPercentage(state, action: PayloadAction<string>): void {
      const id = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, lockedPercentage: null } : slot));
    },
    mergeLot(state, action: PayloadAction<PublicApi.LotUpdateRequest>): void {
      const { query, lot: requestLot } = action.payload;
      const { amountChange, investors, ...lotUpdate } = requestLot;
      const compare: TestLot = Object.entries(query).reduce<TestLot>(
        (compare, [key, value]) =>
          value != null ? (lot: Lot) => slotsQueryComparator[key as keyof LotQuery](lot, value) : compare,
        () => false,
      );
      const updateLot = (lot: Lot): Lot => ({
        ...lot,
        ...lotUpdate,
        contributors: investors ? contributorsFromLegacyInvestors(investors) : lot.contributors,
        amount: amountChange != null ? Number(lot.amount ?? 0) + amountChange : requestLot.amount ?? lot.amount ?? null,
      });

      state.slots = state.slots.map((lot) => {
        if (!compare(lot)) {
          return lot;
        }

        const updatedLot = updateLot(lot);
        slotNamesMap.updateSlot(updatedLot);

        return updatedLot;
      });
      state.slots = recalculateAllLockedSlots(state.slots);
    },
  },
});

export const {
  setSlotData,
  setSlotAmount,
  setSlotName,
  setSlotIsFavorite,
  addSlot,
  deleteSlot,
  resetSlots,
  setSlots,
  reorderSlots,
  setSlotsInitialized,
  addSlotAmount,
  setLotPercentage,
  setSearchTerm,
  mergeLot,
  setLockedPercentage,
  unlockPercentage,
} = slotsSlice.actions;

export const createSlotFromPurchase =
  (bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: { settings },
      slots: { slots },
    } = getState();
    const slotName = bidUtils.getName(bid);
    const amount = bidUtils.parseCost(bid, settings, true);
    const contributorName = getBidContributorName(bid);
    const newSlot: Lot = {
      id: Math.random().toString(),
      name: slotName,
      amount,
      fastId: fastIdAllocator.allocate(),
      contributors: contributorName ? [{ name: contributorName, amount }] : [],
      isFavorite: false,
    };

    const updatedSlots = [...slots, newSlot];
    slotNamesMap.updateSlot(newSlot);

    updateSlotPosition(updatedSlots, updatedSlots.length - 1);
    dispatch(reorderSlots(sortSlots(recalculateAllLockedSlots(updatedSlots))));
    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: newSlot.id, cost: bid.cost }, true));
  };

interface BidHandleOptions {
  removeBid?: boolean;
  callback?: (amount: number) => void;
}

export const addBid =
  (slotId: string | Lot, bid: Purchase, options: BidHandleOptions = {}) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const { removeBid = true, callback } = options;
    const {
      aucSettings: { settings },
      slots: { slots },
    } = getState();

    const targetSlotId = typeof slotId === 'string' ? slotId : slotId.id;
    const lot = slots.find(({ id }) => id === targetSlotId);

    if (!lot) {
      return;
    }

    const { id } = bid;
    const amount = bidUtils.parseCost(bid, settings, false);
    const bidName = bidUtils.getName(bid);

    slotNamesMap.set(bidName, lot.id);

    if (!lot.name || lot.name === '') {
      dispatch(
        setSlotData({
          id: lot.id,
          amount: amount + (lot.amount ?? 0),
          name: bidName,
          contributors: addContributorAmount(lot.contributors, getBidContributorName(bid), amount),
        }),
      );
    } else {
      dispatch(
        setSlotData({
          id: lot.id,
          amount: amount + (lot.amount ?? 0),
          contributors: addContributorAmount(lot.contributors, getBidContributorName(bid), amount),
        }),
      );
    }

    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: lot.id }, false));
    removeBid && dispatch(removePurchase(id));
    callback?.(amount);
  };

export default slotsSlice.reducer;
