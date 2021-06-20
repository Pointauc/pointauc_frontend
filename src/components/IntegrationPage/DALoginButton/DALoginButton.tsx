import React, { FC } from 'react';
import { Button } from '@material-ui/core';
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
      >
        Подключить Donation Alerts
      </Button>
    </>
  );
};

export default TwitchLoginButton;
