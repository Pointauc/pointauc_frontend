import { combineReducers } from '@reduxjs/toolkit';

import broadcasting from '../domains/broadcasting/model/store';

import slots from './Slots/Slots';
import user from './User/User';
import purchases from './Purchases/Purchases';
import notifications from './notifications/notifications';
import aucSettings from './AucSettings/AucSettings';
import subscription from './Subscription/Subscription';
import extraWindows from './ExtraWindows/ExtraWindows';
import requests from './Requests/Requests';
import socketIo from './socketIo/socketIo';
import overlay from './Overlay/Overlay';

const rootReducer = combineReducers({
  slots,
  user,
  purchases,
  notifications,
  aucSettings,
  subscription,
  extraWindows,
  requests,
  socketIo,
  overlay,
  broadcasting,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
