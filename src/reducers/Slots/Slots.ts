import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { Slot, SlotsList } from '../../models/slot.model';
import { RelatedBid } from '../Purchases/Purchases';
import { RootState } from '../index';
import { sortSlots } from '../../utils/common.utils';
import slotNamesMap from '../../services/SlotNamesMap';
import { getAmountSum, getSlotPosition, updateSlot, updateSlotPosition } from '../../utils/slots.utils';

interface SlotsState {
  slots: SlotsList;
}

let maxFastId = 0;

const createSlot = (): Slot => ({
  // eslint-disable-next-line no-plusplus
  fastId: ++maxFastId,
  id: Math.random().toString(),
  extra: null,
  amount: null,
  name: '',
});

const initialState: SlotsState = {
  slots: [[createSlot()], []],
};

const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    setSlotName(state, action: PayloadAction<{ id: string; name: string }>): void {
      const { id, name } = action.payload;
      const { arrayIndex, listIndex } = getSlotPosition(state.slots, id);
      slotNamesMap.updateName(state.slots[listIndex][arrayIndex].name || '', name, id);
      state.slots[listIndex][arrayIndex].name = name;
    },
    setSlotAmount(state, action: PayloadAction<{ id: string; amount: number }>): void {
      const { id, amount } = action.payload;
      updateSlot(state.slots, id, (slot) => ({ ...slot, amount }), true);
    },
    setSlotExtra(state, action: PayloadAction<{ id: string; extra: number }>): void {
      const { id, extra } = action.payload;
      updateSlot(state.slots, id, (slot) => (slot.id === id ? { ...slot, extra } : slot));
    },
    addExtra(state, action: PayloadAction<string>): void {
      const id = action.payload;
      updateSlot(state.slots, id, (slot) => ({ ...slot, extra: null, amount: getAmountSum(slot) }), true);
    },
    deleteSlot(state, action: PayloadAction<string>): void {
      const { arrayIndex, listIndex } = getSlotPosition(state.slots, action.payload);

      if (arrayIndex === -1 || listIndex === -1) {
        return;
      }

      if (state.slots[listIndex].length === 1) {
        state.slots[listIndex] = [createSlot()];
      } else {
        state.slots[listIndex].splice(arrayIndex, 1);
      }

      sortSlots(state.slots[listIndex]);
      slotNamesMap.deleteBySlotId(action.payload);
    },
    addSlot(state, action: PayloadAction<number>): void {
      const newSlot = createSlot();
      state.slots[action.payload] = [...state.slots[action.payload], newSlot];
      sortSlots(state.slots[action.payload]);
      slotNamesMap.set(`#${maxFastId}`, newSlot.id);
    },
    resetSlots(state): void {
      state.slots = initialState.slots;
      slotNamesMap.clear();
    },
    setSlots(state, action: PayloadAction<SlotsList>): void {
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

export const createSlotFromPurchase = ({ id, message: name, cost, isDonation, index = 0 }: RelatedBid) => (
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
  const updatedSlots = [...slots] as SlotsList;
  updatedSlots[index] = [...updatedSlots[index], newSlot];
  slotNamesMap.set(name, id);
  slotNamesMap.set(`#${maxFastId}`, id);

  updateSlotPosition(updatedSlots[index], updatedSlots[index].length - 1);
  updatedSlots[index] = sortSlots(updatedSlots[index]);
  dispatch(setSlots(updatedSlots));
};

export default slotsSlice.reducer;
