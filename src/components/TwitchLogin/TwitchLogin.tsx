import React, { useState } from 'react';
import { Button, IconButton } from '@material-ui/core';
import './TwitchLogin.scss';
import { useDispatch, useSelector } from 'react-redux';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router';
import { RootState } from '../../reducers';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { setUsername } from '../../reducers/User/User';
import WebSocketService from '../../services/WebSocketService';
import { addPurchase, Purchase } from '../../reducers/Purchases/Purchases';
import { connectWithChannelPoints } from '../../api/twitchApi';

const isProduction = (): boolean => process.env.NODE_ENV === 'production';

const HOME_PAGE = isProduction()
  ? 'https://woodsauc-reneawal.netlify.app'
  : 'http://localhost:3000';

const TWITCH_WEBSOCKET_URL = isProduction()
  ? 'wss://woods-service.herokuapp.com'
  : 'ws://localhost:8000';

const getAuthParams = (currentPath: string): Record<string, string> => ({
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${HOME_PAGE}/twitch/redirect?originalPath=${currentPath}`,
  response_type: 'code',
  scope: 'channel:read:redemptions',
  force_verify: 'true',
});

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const MOCK_DATA_REQUEST = 'GET_MOCK_DATA';

const TwitchLogin: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useSelector((root: RootState) => root.user);
  const [pubSubSocket, setPubSubSocket] = useState<WebSocket>();
  const location = useLocation();

  const handleAuth = (): void => {
    const authParams = new URLSearchParams(getAuthParams(location.pathname));
    authUrl.search = authParams.toString();

    window.open(authUrl.toString(), '_self');
  };

  const handleLogout = (): void => {
    Cookies.remove(USERNAME_COOKIE_KEY);
    dispatch(setUsername(null));
  };

  const onMessage = (purchase: Purchase): void => {
    dispatch(addPurchase(purchase));
  };

  const onOpen = (ws: WebSocket): void => setPubSubSocket(ws);

  const onClose = (): void => setPubSubSocket(undefined);

  const handleConnectTwitchPoints = async (): Promise<void> => {
    const webSocketService = new WebSocketService<Purchase>(onMessage, onClose, onOpen);
    webSocketService.connect(TWITCH_WEBSOCKET_URL);
    await connectWithChannelPoints();
  };

  const handleDisconnect = (): void => {
    if (pubSubSocket) {
      pubSubSocket.close();
    }
  };

  const requestMockData = (): void => {
    if (pubSubSocket) {
      pubSubSocket.send(JSON.stringify({ type: MOCK_DATA_REQUEST }));
    }
  };

  return (
    <div className="twitch-login">
      {username ? (
        <>
          <div className="twitch-login-logged-wrapper">
            <span>logged in with</span>
            <span className="twitch-login-username">{username}</span>
            <IconButton className="twitch-login-logout-button" onClick={handleLogout}>
              <MeetingRoomIcon />
            </IconButton>
          </div>
          {pubSubSocket ? (
            <Button
              className="twitch-login-subscribe-button"
              variant="outlined"
              color="secondary"
              onClick={handleDisconnect}
            >
              Отписаться от покупки поинтов
            </Button>
          ) : (
            <Button
              className="twitch-login-subscribe-button"
              variant="outlined"
              color="primary"
              onClick={handleConnectTwitchPoints}
              disabled
            >
              Подписаться на покупку поинтов
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={requestMockData}
            disabled={!pubSubSocket}
            className="twitch-login-mock-data-button"
          >
            Get mock data
          </Button>
        </>
      ) : (
        <>
          <Button
            className="twitch-login-submit-button"
            color="primary"
            variant="contained"
            disableElevation
            onClick={handleAuth}
          >
            login with Twitch
          </Button>
        </>
      )}
    </div>
  );
};

export default TwitchLogin;
