import { combineReducers } from '@reduxjs/toolkit';
import slots from './Slots/Slots';

const rootReducer = combineReducers({
  slots,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
