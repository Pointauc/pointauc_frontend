import { combineReducers } from '@reduxjs/toolkit';
import slots from './Slots/Slots';
import user from './User/User';
import purchases from './Purchases/Purchases';

const rootReducer = combineReducers({
  slots,
  user,
  purchases,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
