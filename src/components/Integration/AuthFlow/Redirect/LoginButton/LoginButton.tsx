import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import classNames from 'classnames';

const RedirectLoginButton = ({ integration }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const {
    branding: { icon: Icon },
    authFlow,
    id,
  } = integration;
  const { t } = useTranslation();
  const handleAuth = (): void => {
    window.open(authFlow.url, '_self');
  };

  return (
    <Button
      className={classNames('login-button', id)}
      variant='contained'
      size='large'
      startIcon={<Icon className='base-icon' />}
      onClick={handleAuth}
    >
      {t(`integration.${id}.name`)}
    </Button>
  );
};

export default RedirectLoginButton;
