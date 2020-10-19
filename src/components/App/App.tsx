import React, { useEffect } from 'react';
import './App.scss';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ROUTES from '../../constants/routes.constants';
import AucPage from '../AucPage/AucPage';
import TwitchRedirect from '../TwitchRedirect/TwitchRedirect';
import VideoPointsPage from '../VideoPointsPage/VideoPointsPage';
import { connectToServer } from '../../reducers/PubSubSocket/PubSubSocket';
import { RootState } from '../../reducers';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import SkipWidget from '../SkipWidjet/SkipWidget';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import HomePage from '../HomePage/HomePage';
import Login from '../Login/Login';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#a6d4fa',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useSelector((root: RootState) => root.user);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

  useEffect(() => {
    if (username) {
      dispatch(connectToServer());
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.IDENTIFY_CLIENT, username }));
    }
  }, [username, webSocket]);

  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <PrivateRoute exact path={ROUTES.HOME}>
            <HomePage />
          </PrivateRoute>
          <PrivateRoute path={ROUTES.AUC_PAGE}>
            <AucPage />
          </PrivateRoute>
          <PrivateRoute path={ROUTES.VIDEO_REQUESTS}>
            <VideoPointsPage />
          </PrivateRoute>
          <PrivateRoute path={ROUTES.SKIP_WIDGET}>
            <SkipWidget />
          </PrivateRoute>
          <Route path={ROUTES.TWITCH_REDIRECT}>
            <TwitchRedirect />
          </Route>
          <Route path={ROUTES.LOGIN}>
            <Login />
          </Route>
        </Switch>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;
