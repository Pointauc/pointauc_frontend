import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { RootState } from '../../../reducers';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';

const authParams = {
  client_id: '6727',
  redirect_uri: `${window.location.origin}/da/redirect`,
  response_type: 'code',
  scope: 'oauth-donation-subscribe oauth-user-show',
  force_verify: 'true',
};

const authUrl = new URL('https://www.donationalerts.com/oauth/authorize');

const TwitchLoginButton: FC = () => {
  const { username } = useSelector((root: RootState) => root.user);

  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  return (
    <>
      <Button
        className="da-login-button"
        variant="contained"
        size="large"
        startIcon={<DASvg className="base-icon da" />}
        onClick={handleAuth}
        disabled={!username}
      >
        Подключить Donation Alerts
      </Button>
      {!username && (
        <div className="hint" style={{ marginTop: 12 }}>
          (Требуется Twitch авторизация)
        </div>
      )}
    </>
  );
};

export default TwitchLoginButton;
