import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import { AnyAction, configureStore, Middleware } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import moment from 'moment';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import rootReducer, { RootState } from './reducers';
import { Slot } from './models/slot.model';
import { setSlots } from './reducers/Slots/Slots';
import 'moment/locale/ru'; // without this line it didn't work

moment.locale('ru');

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/createSlotFromPurchase',
  'slots/addSlot',
];

const sortSlotsMiddleware: Middleware<{}, RootState> = (store) => (next) => (action): AnyAction => {
  const result = next(action);
  if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
    const slots = [...store.getState().slots.slots];
    const sortedSlots = slots.sort((a: Slot, b: Slot) => {
      if (a.amount === undefined) {
        return 1;
      }

      return Number(b.amount) - Number(a.amount);
    });
    return next(setSlots(sortedSlots));
  }
  return result;
};

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware],
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
