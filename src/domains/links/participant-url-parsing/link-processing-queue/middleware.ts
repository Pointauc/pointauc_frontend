import { AnyAction, Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@reducers';

import { ParsingQueue } from './parsing-queue/ParsingQueue';
import {
  BULK_LOT_NAME_UPDATE_ACTIONS,
  DELETE_SLOT_ACTION,
  LOT_LINK_PARSING_SETTING_ACTION,
  SET_SLOT_DATA_ACTION,
  SET_SLOT_NAME_ACTION,
} from './config';

type SetSlotNameAction = PayloadAction<{ id: string; name: string; ignoreParsing?: boolean }>;
type SetSlotDataAction = PayloadAction<{ id: string; name?: string | null }>;
type DeleteSlotAction = PayloadAction<string>;

interface ActionHandlerContext {
  action: AnyAction;
  nextState: RootState;
  previousState: RootState | null;
  queue: ParsingQueue;
}

type ActionHandler = (context: ActionHandlerContext) => void;

const syncSlotsHandler: ActionHandler = ({ previousState, nextState, queue }) => {
  if (!previousState) {
    return;
  }

  queue.syncSlots(previousState.slots.slots, nextState.slots.slots);
};

const actionHandlers: Partial<Record<string, ActionHandler>> = {
  ...Object.fromEntries(Array.from(BULK_LOT_NAME_UPDATE_ACTIONS, (actionType) => [actionType, syncSlotsHandler])),
  [LOT_LINK_PARSING_SETTING_ACTION]: ({ previousState, nextState, queue }) => {
    if (!previousState) {
      return;
    }

    const wasLotLinkParsingEnabled = previousState.aucSettings.settings.isLotLinkParsingEnabled;
    const isLotLinkParsingEnabled = nextState.aucSettings.settings.isLotLinkParsingEnabled;

    if (!wasLotLinkParsingEnabled && isLotLinkParsingEnabled) {
      queue.syncSlots([], nextState.slots.slots);
    }
  },
  [SET_SLOT_NAME_ACTION]: ({ action, queue }) => {
    const typedAction = action as SetSlotNameAction;

    if (typedAction.payload.ignoreParsing) {
      return;
    }

    queue.queueLotName(typedAction.payload.id, typedAction.payload.name);
  },
  [SET_SLOT_DATA_ACTION]: ({ action, queue }) => {
    const typedAction = action as SetSlotDataAction;

    if (!('name' in typedAction.payload)) {
      return;
    }

    queue.queueLotName(typedAction.payload.id as string, typedAction.payload.name ?? null);
  },
  [DELETE_SLOT_ACTION]: ({ action, queue }) => {
    queue.removeLot((action as DeleteSlotAction).payload);
  },
};

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
      const handler = actionHandlers[action.type];
      if (!handler) {
        return next(action);
      }
      const previousState = storeApi.getState();
      const result = next(action);
      if (queue) {
        handler({
          action,
          nextState: storeApi.getState(),
          previousState,
          queue,
        });
      }

      return result;
    };
  };
};
