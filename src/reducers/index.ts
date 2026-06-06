import { combineReducers } from '@reduxjs/toolkit';

import broadcasting from '../domains/broadcasting/model/store';
import lotLinkParsing from '../domains/links/participant-url-parsing/link-processing-queue/slice';
import activeAuctionHistory from '../domains/auction/history/model/activeAuctionHistorySlice';

import actionsLog from './ActionsLog/ActionsLog';
import slots from './Slots/Slots';
import user from './User/User';
import purchases from './Purchases/Purchases';
import aucSettings from './AucSettings/AucSettings';
import extraWindows from './ExtraWindows/ExtraWindows';
import overlay from './Overlay/Overlay';

const rootReducer = combineReducers({
  slots,
  user,
  purchases,
  actionsLog,
  aucSettings,
  extraWindows,
  overlay,
  broadcasting,
  lotLinkParsing,
  activeAuctionHistory,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
