import { configureStore } from '@reduxjs/toolkit';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { throttle } from '@tanstack/react-pacer';

import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import { Slot } from '@models/slot.model';
import { sortSlots } from '@utils/common.utils';
import { recalculateAllLockedSlots } from '@utils/lockedPercentage.utils';

import { setSlots, slotsSlice } from './Slots/Slots';

import rootReducer, { RootState } from './index';

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotData',
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
  'slots/mergeLot',
  'slots/setLockedPercentage',
];

const sortSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
      const { slots } = store.getState().slots;
      const updatedSlots = recalculateAllLockedSlots(slots);
      const sortedSlots = sortSlots(updatedSlots);

      return next(setSlots(sortedSlots));
    }
    return result;
  };

const SLOTS_UPDATE_EVENTS = Object.keys(slotsSlice.actions).map((actionName) => `${slotsSlice.name}/${actionName}`);

const saveSlotsWithCooldown = throttle(
  (slots: Slot[]) => {
    const lots = slotsToArchivedLots(slots);
    archiveApi
      .upsertAutosave({ lots })
      .then(() => console.log('Autosave updated', lots))
      .catch((err) => console.error('Autosave failed:', err));
  },
  { wait: 2000, trailing: true, leading: false },
);

const saveSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SLOTS_UPDATE_EVENTS.includes(action.type)) {
      const { slots } = store.getState().slots;

      saveSlotsWithCooldown(slots);
    }
    return result;
  };

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware, saveSlotsMiddleware],
});

// Handle autosave before page unload
window.onbeforeunload = (): undefined => {
  const { slots } = store.getState().slots;

  if (slots.length > 1) {
    const lots = slotsToArchivedLots(slots);
    archiveApi.upsertAutosave({ lots }).catch((err) => console.error('Final autosave failed:', err));
  }

  return undefined;
};

export type AppDispatch = typeof store.dispatch;
