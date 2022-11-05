import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import { AnyAction, configureStore, Middleware } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import dayjs from 'dayjs';
import { Route, Router, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import rootReducer, { RootState } from './reducers';
import { setSlots } from './reducers/Slots/Slots';
import ROUTES from './constants/routes.constants';
import TwitchRedirect from './pages/redirects/TwitchRedirect/TwitchRedirect';
import DARedirect from './pages/redirects/DARedirect/DARedirect';
import { sortSlots } from './utils/common.utils';
import ChatWheelPage from './components/ChatWheelPage/ChatWheelPage';
import { theme } from './constants/theme.constants';
import NewDomainRedirect from './components/NewDomainRedirect/NewDomainRedirect';
import history from './constants/history';
import SaveLoadService from './services/SaveLoadService';
import AudioRoom from './components/AudioRoom/AudioRoom';
import './assets/i18n';

dayjs.locale('ru');

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
];

const sortSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
      const sortedSlots = sortSlots(store.getState().slots.slots);

      return next(setSlots(sortedSlots));
    }
    return result;
  };

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware],
});

window.onbeforeunload = (): undefined => {
  const { slots } = store.getState().slots;

  if (slots.length > 1) {
    SaveLoadService.rewrite(slots, 'Автосохранение');
  }

  return undefined;
};

if (window.location.host === 'woodsauc-reneawal.netlify.app') {
  ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <NewDomainRedirect />
    </MuiThemeProvider>,
    document.getElementById('root'),
  );
} else {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route exact path={ROUTES.TWITCH_REDIRECT}>
            <TwitchRedirect />
          </Route>
          <Route exact path={ROUTES.DA_REDIRECT}>
            <DARedirect />
          </Route>
          <Route exact path={ROUTES.CHAT_WHEEL}>
            <ChatWheelPage />
          </Route>
          <Route exact path={ROUTES.AUDIO_ROOM}>
            <MuiThemeProvider theme={theme}>
              <AudioRoom />
            </MuiThemeProvider>
          </Route>
          <Route path={ROUTES.HOME}>
            <App />
          </Route>
        </Switch>
      </Router>
    </Provider>,
    document.getElementById('root'),
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
