import { combineReducers } from '@reduxjs/toolkit';
import slots from './Slots/Slots';
import user from './User/User';
import purchases from './Purchases/Purchases';
import notifications from './notifications/notifications';
import pubSubSocket from './PubSubSocket/PubSubSocket';
import aucSettings from './AucSettings/AucSettings';
import subscription from './Subscription/Subscription';
import extraWindows from './ExtraWindows/ExtraWindows';
import requests from './Requests/Requests';
import socketIo from './socketIo/socketIo';

const rootReducer = combineReducers({
  slots,
  user,
  purchases,
  notifications,
  pubSubSocket,
  aucSettings,
  subscription,
  extraWindows,
  requests,
  socketIo,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
