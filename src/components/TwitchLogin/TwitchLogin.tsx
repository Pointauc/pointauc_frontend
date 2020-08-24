import React, { useEffect, useState } from 'react';
import { Button, IconButton } from '@material-ui/core';
import './TwitchLogin.scss';
import { useDispatch, useSelector } from 'react-redux';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router';
import { RootState } from '../../reducers';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { setUsername } from '../../reducers/User/User';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { isProduction } from '../../utils/common.utils';
import LoadingButton from '../LoadingButton/LoadingButton';

const HOME_PAGE = isProduction()
  ? 'https://woodsauc-reneawal.netlify.app'
  : 'http://localhost:3000';

const getAuthParams = (currentPath: string): Record<string, string> => ({
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${HOME_PAGE}/twitch/redirect?originalPath=${currentPath}`,
  response_type: 'code',
  scope: 'channel:read:redemptions',
  force_verify: 'true',
});

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const TwitchLogin: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { username } = useSelector((root: RootState) => root.user);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  const handleSubscribeMessage = ({ data }: MessageEvent): void => {
    const { type } = JSON.parse(data);
    switch (type) {
      case MESSAGE_TYPES.CP_SUBSCRIBED:
        setIsSubscribed(true);
        setIsSubscribeLoading(false);
        break;

      case MESSAGE_TYPES.CP_UNSUBSCRIBED:
        setIsSubscribed(false);
        setIsSubscribeLoading(false);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', handleSubscribeMessage);
    }
  }, [webSocket]);

  const handleAuth = (): void => {
    const authParams = new URLSearchParams(getAuthParams(location.pathname));
    authUrl.search = authParams.toString();

    window.open(authUrl.toString(), '_self');
  };

  const handleLogout = (): void => {
    Cookies.remove(USERNAME_COOKIE_KEY);
    dispatch(setUsername(null));
  };

  const subscribeTwitchPoints = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_SUBSCRIBE, username }));
      setIsSubscribeLoading(true);
    }
  };

  const unsubscribeTwitchPoints = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_UNSUBSCRIBE, username }));
      setIsSubscribeLoading(true);
    }
  };

  const requestMockData = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.MOCK_PURCHASE }));
    }
  };

  const isSubscribeDisabled = !webSocket || isSubscribeLoading;

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
          {isSubscribed ? (
            <LoadingButton
              className="twitch-login-subscribe-button"
              variant="outlined"
              color="secondary"
              onClick={unsubscribeTwitchPoints}
              disabled={isSubscribeDisabled}
              isLoading={isSubscribeLoading}
            >
              Отписаться от покупки поинтов
            </LoadingButton>
          ) : (
            <LoadingButton
              className="twitch-login-subscribe-button"
              variant="outlined"
              color="primary"
              onClick={subscribeTwitchPoints}
              disabled={isSubscribeDisabled}
              isLoading={isSubscribeLoading}
            >
              Подписаться на покупку поинтов
            </LoadingButton>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={requestMockData}
            disabled={!webSocket}
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
