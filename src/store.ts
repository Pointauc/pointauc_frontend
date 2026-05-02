import { configureStore, type Reducer } from '@reduxjs/toolkit';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { throttle } from '@tanstack/react-pacer';

import { reorderSlots, slotsSlice } from '@reducers/Slots/Slots.ts';
import { recalculateAllLockedSlots } from '@utils/lockedPercentage.utils.ts';
import { sortSlots } from '@utils/common.utils.ts';
import { isBrowser } from '@utils/ssr.ts';
import { Slot } from '@models/slot.model.ts';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { createArchiveData } from '@domains/auction/archive/lib/archiveData';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import { purchasesSlice } from '@reducers/Purchases/Purchases.ts';

import type { RootState } from '@reducers/index.ts';

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotData',
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
  'slots/mergeLot',
  'slots/setLockedPercentage',
  'slots/setSlotIsFavorite',
];

const sortSlotsMiddleware: Middleware<{}, RootState> =
  (storeApi) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
      const { slots } = storeApi.getState().slots;
      const updatedSlots = recalculateAllLockedSlots(slots);
      const sortedSlots = sortSlots(updatedSlots);

      return next(reorderSlots(sortedSlots));
    }
    return result;
  };

// Lazily computed to avoid circular-dep temporal dead zone in SSR bundles.
let _slotsUpdateEvents: string[] | null = null;
const getSlotsUpdateEvents = () => {
  if (!_slotsUpdateEvents) {
    _slotsUpdateEvents = Object.keys(slotsSlice.actions).map((actionName) => `${slotsSlice.name}/${actionName}`);
  }
  return _slotsUpdateEvents;
};

let _purchaseUpdateEvents: string[] | null = null;
const excludeBidUpdateEventNames = ['setDraggedRedemption', 'addPurchaseLog'];
const getPurchaseUpdateEvents = () => {
  if (!_purchaseUpdateEvents) {
    _purchaseUpdateEvents = Object.keys(purchasesSlice.actions)
      .map((actionName) => `${purchasesSlice.name}/${actionName}`)
      .filter((actionName) => !excludeBidUpdateEventNames.includes(actionName));
  }
  return _purchaseUpdateEvents;
};

let _autosaveEvents: string[] | null = null;
const getAutosaveEvents = () => {
  if (!_autosaveEvents) {
    _autosaveEvents = [...getSlotsUpdateEvents(), ...getPurchaseUpdateEvents()];
  }
  return _autosaveEvents;
};

const saveSlotsWithCooldown = throttle(
  ({ slots, purchases }: { slots: Slot[]; purchases: RootState['purchases']['purchases'] }) => {
    if (!isBrowser || slots.length === 1) return;
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
  (storeApi) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    const {
      slots: { slots, isInitialized },
      purchases: { purchases },
    } = storeApi.getState();
    const autosaveEvents = getAutosaveEvents();

    if (isInitialized && autosaveEvents.includes(action.type)) {
      saveSlotsWithCooldown({ slots, purchases });
    }
    return result;
  };

/**
 * The singleton Redux store.
 * Starts as `null`; initialized by `initStore()` called from main.tsx.
 * Integration files import this via `@store` and access it only inside
 * function callbacks — live ES module binding ensures they see the real
 * store once it is set, even across circular imports.
 */
export let store: any = null;

/**
 * Creates and sets the application store. Must be called once at startup
 * (from main.tsx) before any integration callbacks execute.
 * Accepts rootReducer as a parameter to avoid importing it at module scope,
 * which would trigger a circular-dependency TDZ in Rollup SSR bundles.
 */
export function initStore(rootReducer: Reducer<any>) {
  store = configureStore({
    reducer: rootReducer,
    middleware: [thunk, sortSlotsMiddleware, saveSlotsMiddleware],
  });
  return store;
}
