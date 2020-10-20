import React from 'react';
import { Button, Paper } from '@material-ui/core';
import { isProduction } from '../../utils/common.utils';
import { ReactComponent as TwitchSvg } from '../../assets/icons/twitch.svg';
import '../AucPage/AucPage.scss';
import './Login.scss';

const HOME_PAGE = isProduction() ? 'https://woodsauc-reneawal.netlify.app' : 'http://localhost:3000';

const authParams = {
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${HOME_PAGE}/twitch/redirect`,
  response_type: 'code',
  scope: 'channel:read:redemptions',
  force_verify: 'true',
};

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const Login: React.FC = () => {
  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  return (
    <Paper className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }} square>
      <div>
        <Button
          color="primary"
          variant="contained"
          size="large"
          startIcon={<TwitchSvg className="twitch-icon" />}
          onClick={handleAuth}
        >
          Войти через twitch
        </Button>
      </div>
    </Paper>
  );
};

export default Login;
