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
          <Route exact path={ROUTES.AUC_PAGE}>
            <AucPage />
          </Route>
          <Route path={ROUTES.TWITCH_REDIRECT}>
            <TwitchRedirect />
          </Route>
          <Route path={ROUTES.VIDEO_POINTS_PAGE}>
            <VideoPointsPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;
