import React, { useState } from 'react';
import { Button, IconButton } from '@material-ui/core';
import './TwitchLogin.scss';
import { useDispatch, useSelector } from 'react-redux';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Cookies from 'js-cookie';
import { RootState } from '../../reducers';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { setUsername } from '../../reducers/User/User';
import WebSocketService from '../../services/WebSocketService';
import { addPurchase, Purchase } from '../../reducers/Purchases/Purchases';

const AUTH_PARAMS = {
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: 'http://localhost:3000/twitch/redirect',
  response_type: 'code',
  scope: 'channel_read channel:moderate',
};

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
const authParams = new URLSearchParams(AUTH_PARAMS);
authUrl.search = authParams.toString();

const TWITCH_WEBSOCKET_URL = 'ws://localhost:8080';
const MOCK_DATA_REQUEST = 'GET_MOCK_DATA';

const TwitchLogin: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useSelector((root: RootState) => root.user);
  const [pubSubSocket, setPubSubSocket] = useState<WebSocket>();

  const handleAuth = (): void => {
    window.open(authUrl.toString(), '_self');
  };

  const handleLogout = (): void => {
    Cookies.remove(USERNAME_COOKIE_KEY);
    dispatch(setUsername(null));
  };

  const onMessage = (purchase: Purchase): void => {
    console.log(purchase);
    dispatch(addPurchase(purchase));
    // const message = JSON.parse(event.data);
    // console.log(message);
    // if (message.data) {
    //   console.log(message.data.message);
    //   console.log(JSON.parse(message.data.message));
    // }
  };

  const onOpen = (ws: WebSocket): void => setPubSubSocket(ws);

  const onClose = (): void => setPubSubSocket(undefined);

  const handleConnectTwitchPoints = (): void => {
    const webSocketService = new WebSocketService<Purchase>(onMessage, onClose, onOpen);
    webSocketService.connect(TWITCH_WEBSOCKET_URL);
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
            <Button variant="outlined" color="secondary" onClick={handleDisconnect}>
              Отписаться от покупки поинтов
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={handleConnectTwitchPoints}>
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
