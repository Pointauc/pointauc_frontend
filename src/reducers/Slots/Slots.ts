import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { ReactText } from 'react';
import { Action } from 'redux';
import { Slot } from '../../models/slot.model';
import { Purchase } from '../Purchases/Purchases';
import { RootState } from '../index';
import { sortSlots } from '../../utils/common.utils';
import slotNamesMap from '../../services/SlotNamesMap';

interface SlotsState {
  slots: Slot[];
}

let maxFastId = 0;

const createSlot = (): Slot => {
  const slot = {
    // eslint-disable-next-line no-plusplus
    fastId: ++maxFastId,
    id: Math.random().toString(),
    extra: null,
    amount: null,
    name: '',
  };

  slotNamesMap.set(`#${slot.fastId}`, slot.id);

  return slot;
};

const initialState: SlotsState = {
  slots: [createSlot()],
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
    addSlot(state): void {
      const newSlot = createSlot();
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
} = slotsSlice.actions;

export const createSlotFromPurchase = ({ id, message: name, cost, isDonation }: Purchase) => (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): void => {
  const {
    aucSettings: {
      integration: {
        da: { pointsRate },
      },
    },
    slots: { slots },
  } = getState();
  // eslint-disable-next-line no-plusplus
  const newSlot: Slot = { id, name, amount: isDonation ? cost * pointsRate : cost, extra: null, fastId: ++maxFastId };
  const updatedSlots = [...slots, newSlot];
  slotNamesMap.set(name, id);
  slotNamesMap.set(`#${maxFastId}`, id);

  updateSlotPosition(updatedSlots, updatedSlots.length - 1);
  dispatch(setSlots(sortSlots(updatedSlots)));
};

export default slotsSlice.reducer;
