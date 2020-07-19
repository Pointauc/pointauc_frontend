import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Slot } from '../../models/slot.model';

interface SlotsState {
  slots: Slot[];
}

const createSlot = (): Slot => ({
  id: Math.random(),
  extra: '',
  amount: '',
  name: '',
});

const initialState: SlotsState = {
  slots: [createSlot()],
};

const getAmountSum = (slot: Slot): string =>
  slot.extra ? (Number(slot.amount) + Number(slot.extra)).toString() : slot.amount;

const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    setSlotName(state, action: PayloadAction<{ id: number; name: string }>): void {
      const { id, name } = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, name } : slot));
    },
    setSlotAmount(state, action: PayloadAction<{ id: number; amount: string }>): void {
      const { id, amount } = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, amount } : slot));
    },
    setSlotExtra(state, action: PayloadAction<{ id: number; extra: string }>): void {
      const { id, extra } = action.payload;
      state.slots = state.slots.map((slot) => (slot.id === id ? { ...slot, extra } : slot));
    },
    addExtra(state, action: PayloadAction<number>): void {
      const id = action.payload;
      state.slots = state.slots.map((slot) =>
        slot.id === id ? { ...slot, extra: '', amount: getAmountSum(slot) } : slot,
      );
    },
    addSlot(state): void {
      state.slots = [...state.slots, createSlot()];
    },
  },
});

export const { setSlotAmount, setSlotExtra, setSlotName, addExtra, addSlot } = slotsSlice.actions;

export default slotsSlice.reducer;
