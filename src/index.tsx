import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import dayjs from 'dayjs';
import { Route, Router, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import rootReducer from './reducers';
import ROUTES from './constants/routes.constants';
import TwitchRedirect from './components/TwitchRedirect/TwitchRedirect';
import DARedirect from './components/DARedirect/DARedirect';
import ChatWheelPage from './components/ChatWheelPage/ChatWheelPage';
import { theme } from './constants/theme.constants';
import NewDomainRedirect from './components/NewDomainRedirect/NewDomainRedirect';
import history from './constants/history';

dayjs.locale('ru');

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
  immutableCheck: false,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: customizedMiddleware,
});

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
