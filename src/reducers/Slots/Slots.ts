import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { Slot } from '../../models/slot.model';
import { logPurchase, Purchase, removePurchase } from '../Purchases/Purchases';
import { RootState } from '../index';
import { getRandomIntInclusive, sortSlots } from '../../utils/common.utils';
import slotNamesMap from '../../services/SlotNamesMap';
import { PurchaseStatusEnum } from '../../models/purchase';

interface SlotsState {
  slots: Slot[];
  searchTerm: string;
}

let maxFastId = 0;

const createSlot = (props: Partial<Slot> = {}): Slot => {
  const slot = {
    // eslint-disable-next-line no-plusplus
    fastId: ++maxFastId,
    id: Math.random().toString(),
    extra: null,
    amount: null,
    name: '',
    ...props,
  };

  slotNamesMap.set(`#${slot.fastId}`, slot.id);

  return slot;
};

export const createRandomSlots = (count: number, max: number, min = 1): Slot[] =>
  sortSlots(
    Array(count)
      .fill(null)
      .map(() => {
        const amount = getRandomIntInclusive(min, max);

        return createSlot({ amount, name: amount.toString() });
      }),
  );

const initialState: SlotsState = {
  slots: [createSlot()],
  searchTerm: '',
  // slots: [
  // ...createRandomSlots(2, 20000, 10000),
  // ...createRandomSlots(5, 10000, 500),
  // ...createRandomSlots(4, 650, 600),
  // ...createRandomSlots(100, 300, 100),
  // ],
  // slots: [createSlot({ amount: 50, name: '1' }), createSlot({ amount: 50, name: '2' })],
  // slots: [...new Array(6).fill(null).map(() => createSlot({ amount: 100, name: '100' }))],
};

const getAmountSum = (slot: Slot): number | null => (slot.extra ? Number(slot.amount) + slot.extra : slot.amount);

const updateSlotPosition = (slots: Slot[], index: number): void => {
  if (Number(slots[index].amount) >= Number(slots[0].amount)) {
    slots.unshift(slots.splice(index, 1)[0]);
  }
};

const updateSlotAmount = (slots: Slot[], updatedId: ReactText, transform: (slot: Slot) => Slot): void => {
  const updatedIndex = slots.findIndex(({ id }) => updatedId === id);

  slots[updatedIndex] = transform(slots[updatedIndex]);
  updateSlotPosition(slots, updatedIndex);
};

const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    setSlotName(state, action: PayloadAction<{ id: string; name: string }>): void {
      const { id, name } = action.payload;
      state.slots = state.slots.map((slot) => {
        if (slot.id === id) {
          slotNamesMap.updateName(slot.name || '', name, slot.id);

          return { ...slot, name };
        }

        return slot;
      });
    },
    addSlotAmount(state, action: PayloadAction<{ id: ReactText; amount: number }>): void {
      const { id, amount } = action.payload;
      updateSlotAmount(state.slots, id, (slot) => ({ ...slot, amount: (slot.amount || 0) + amount }));
    },
    setSlotAmount(state, action: PayloadAction<{ id: ReactText; amount: number }>): void {
      const { id, amount } = action.payload;
      updateSlotAmount(state.slots, id, (slot) => ({ ...slot, amount }));
    },
    setSlotExtra(state, action: PayloadAction<{ id: ReactText; extra: number }>): void {
      const { id, extra } = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, extra } : slot));
    },
    addExtra(state, action: PayloadAction<ReactText>): void {
      const id = action.payload;
      updateSlotAmount(state.slots, id, (slot) => ({ ...slot, extra: null, amount: getAmountSum(slot) }));
    },
    deleteSlot(state, action: PayloadAction<string>): void {
      const deletedId = action.payload;
      slotNamesMap.deleteBySlotId(deletedId);

      if (state.slots.length === 1) {
        state.slots = [createSlot()];
      } else {
        state.slots = state.slots.filter(({ id }) => deletedId !== id);
      }
    },
    addSlot(state, action?: PayloadAction<Partial<Slot>>): void {
      const newSlot = { ...createSlot(), ...action?.payload };
      state.slots = [...state.slots, newSlot];
      slotNamesMap.set(`#${maxFastId}`, newSlot.id);
    },
    resetSlots(state): void {
      state.slots = initialState.slots;
      slotNamesMap.clear();
    },
    setSlots(state, action: PayloadAction<Slot[]>): void {
      state.slots = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>): void {
      state.searchTerm = action.payload;
    },
  },
});

export const {
  setSlotAmount,
  setSlotExtra,
  setSlotName,
  addExtra,
  addSlot,
  deleteSlot,
  resetSlots,
  setSlots,
  addSlotAmount,
  setSearchTerm,
} = slotsSlice.actions;

export const createSlotFromPurchase =
  (bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: {
        integration: {
          da: { pointsRate },
        },
      },
      slots: { slots },
    } = getState();
    const { id, message: name, cost, isDonation } = bid;
    // eslint-disable-next-line no-plusplus
    const newSlot: Slot = { id, name, amount: isDonation ? cost * pointsRate : cost, extra: null, fastId: ++maxFastId };
    const updatedSlots = [...slots, newSlot];
    slotNamesMap.set(name, id);
    slotNamesMap.set(`#${maxFastId}`, id);

    updateSlotPosition(updatedSlots, updatedSlots.length - 1);
    dispatch(setSlots(sortSlots(updatedSlots)));
    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: id.toString(), cost }));
  };

export const addBid =
  (slotId: string, bid: Purchase) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const {
      aucSettings: {
        settings: { marbleRate = 1, marblesAuc },
        integration: {
          da: { pointsRate },
        },
      },
      slots: { slots },
    } = getState();

    if (!slots.find(({ id }) => id === slotId)) {
      return;
    }

    const convertToMarble = (cost: number): number => Math.floor(cost / marbleRate);
    const convertCost = (cost: number): number => (marblesAuc ? convertToMarble(cost) : cost);
    const { message, cost, isDonation, id } = bid;
    const addedCost = isDonation ? cost * pointsRate : cost;

    slotNamesMap.set(message, slotId);
    dispatch(addSlotAmount({ id: slotId, amount: convertCost(addedCost) }));
    dispatch(logPurchase({ ...bid, status: PurchaseStatusEnum.Processed, target: slotId }));
    dispatch(removePurchase(id));
  };

export default slotsSlice.reducer;
