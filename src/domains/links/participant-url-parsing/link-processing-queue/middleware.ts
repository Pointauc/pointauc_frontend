import { Middleware } from 'redux';

import { RootState } from '@reducers';

import { ParsingQueue } from './parsing-queue/ParsingQueue';
import {
  BULK_LOT_NAME_UPDATE_ACTIONS,
  DELETE_SLOT_ACTION,
  LOT_LINK_PARSING_SETTING_ACTION,
  SET_SLOT_DATA_ACTION,
  SET_SLOT_NAME_ACTION,
} from './config';

/**
 * Redux action router for centralized lot-link parsing.
 *
 * The parsing queue owns CPU parsing and forwards valid links to the fetch queue.
 * This middleware only decides which store actions can change lot names.
 */
export const createLotLinkParsingMiddleware = (): Middleware<{}, RootState> => {
  let queue: ParsingQueue | null = null;

  return (storeApi) => {
    queue = new ParsingQueue(storeApi.dispatch, storeApi.getState);

    return (next) => (action) => {
      const shouldSyncSlots = BULK_LOT_NAME_UPDATE_ACTIONS.has(action.type);
      const shouldCheckSettings = action.type === LOT_LINK_PARSING_SETTING_ACTION;
      const previousState = shouldSyncSlots || shouldCheckSettings ? storeApi.getState() : null;
      const previousSlots = previousState?.slots.slots ?? null;
      const wasLotLinkParsingEnabled = previousState?.aucSettings.settings.isLotLinkParsingEnabled ?? false;
      const result = next(action);
      const nextState = storeApi.getState();

      if (shouldCheckSettings && !wasLotLinkParsingEnabled && nextState.aucSettings.settings.isLotLinkParsingEnabled) {
        queue?.syncSlots([], nextState.slots.slots);
        return result;
      }

      if (previousSlots) {
        queue?.syncSlots(previousSlots, nextState.slots.slots);
        return result;
      }

      if (action.type === SET_SLOT_NAME_ACTION && !action.payload.ignoreParsing) {
        queue?.queueLotName(action.payload.id, action.payload.name);
        return result;
      }

      if (action.type === SET_SLOT_DATA_ACTION && 'name' in action.payload) {
        queue?.queueLotName(action.payload.id, action.payload.name ?? null);
        return result;
      }

      if (action.type === DELETE_SLOT_ACTION) {
        queue?.removeLot(action.payload);
      }

      return result;
    };
  };
};
