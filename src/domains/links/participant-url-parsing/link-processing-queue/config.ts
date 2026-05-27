export const PARSE_BATCH_SIZE = 300;
export const FETCH_TIMEOUT_MS = 30_000;
export const MAX_ACTIVE_FETCHES = 5;
export const FAILED_LINK_CACHE_LIMIT = 500;
export const FAILED_LINK_CACHE_TTL_MS = 5 * 60_000;

export const SET_SLOT_DATA_ACTION = 'slots/setSlotData';
export const SET_SLOT_NAME_ACTION = 'slots/setSlotName';
export const DELETE_SLOT_ACTION = 'slots/deleteSlot';
export const REORDER_SLOTS_ACTION = 'slots/reorderSlots';
export const LOT_LINK_PARSING_SETTING_ACTION = 'aucSettings/setAucSettings';

/**
 * Actions whose payload may replace many lots or update lots through a non-trivial matcher.
 * These need a before/after slot sync instead of an O(1) payload shortcut.
 */
export const BULK_LOT_NAME_UPDATE_ACTIONS = new Set([
  'slots/addSlot',
  'slots/setSlots',
  'slots/resetSlots',
  'slots/mergeLot',
]);
