import { configureStore } from '@reduxjs/toolkit';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { throttle } from '@tanstack/react-pacer';

import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { createArchiveData } from '@domains/auction/archive/lib/archiveData';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import { createLotLinkParsingMiddleware } from '@domains/links/participant-url-parsing/link-processing-queue/middleware';
import { Slot } from '@models/slot.model';
import { purchasesSlice } from '@reducers/Purchases/Purchases.ts';
import { sortSlots } from '@utils/common.utils';
import { recalculateAllLockedSlots } from '@utils/lockedPercentage.utils';

import { reorderSlots, slotsSlice } from './Slots/Slots';

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

      return next(reorderSlots(sortedSlots));
    }
    return result;
  };

const SLOTS_UPDATE_EVENTS = Object.keys(slotsSlice.actions).map((actionName) => `${slotsSlice.name}/${actionName}`);
const PURCHASE_UPDATE_EVENTS = Object.keys(purchasesSlice.actions).map(
  (actionName) => `${purchasesSlice.name}/${actionName}`,
);

const saveSlotsWithCooldown = throttle(
  ({ slots, purchases }: { slots: Slot[]; purchases: RootState['purchases']['purchases'] }) => {
    const data = createArchiveData({
      lots: slotsToArchivedLots(slots),
      purchases,
      isAutosave: true,
    });
    archiveApi
      .upsertAutosave(data)
      .then(() => console.log('Autosave updated', data))
      .catch((err) => console.error('Autosave failed:', err));
  },
  { wait: 2000, trailing: true, leading: false },
);

const saveSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if ([...SLOTS_UPDATE_EVENTS, ...PURCHASE_UPDATE_EVENTS].includes(action.type)) {
      const {
        slots: { slots },
        purchases: { purchases },
      } = store.getState();

      saveSlotsWithCooldown({ slots, purchases });
    }
    return result;
  };

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware, createLotLinkParsingMiddleware(), saveSlotsMiddleware],
});

// Handle autosave before page unload
window.onbeforeunload = (): undefined => {
  const {
    slots: { slots },
    purchases: { purchases },
  } = store.getState();

  if (slots.length > 1 || purchases.length > 0) {
    const data = createArchiveData({
      lots: slotsToArchivedLots(slots),
      purchases,
      isAutosave: true,
    });
    archiveApi.upsertAutosave(data).catch((err) => console.error('Final autosave failed:', err));
  }

  return undefined;
};

export type AppDispatch = typeof store.dispatch;
