import { FC } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TwitchSvg from '@assets/icons/twitch.svg?react';

const authParams = {
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${window.location.origin}/twitch/redirect`,
  response_type: 'code',
  scope: 'channel:read:redemptions channel:manage:redemptions',
  force_verify: 'true',
};

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const TwitchLoginButton: FC = () => {
  const { t } = useTranslation();
  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  return (
    <Button
      className='login-button twitch'
      variant='contained'
      size='large'
      startIcon={<TwitchSvg className='base-icon' />}
      onClick={handleAuth}
    >
      {t('common.connectTwitch')}
    </Button>
  );
};

export default TwitchLoginButton;
