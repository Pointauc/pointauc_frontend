import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import TokenLoginModal from '@components/Integration/AuthFlow/Token/TokenLoginButton/TokenLoginModal.tsx';

import TokenFlow = Integration.TokenFlow;

const TokenLoginButton = ({ integration }: Integration.LoginButtonProps<TokenFlow>) => {
  const {
    branding: { icon: Icon },
    authFlow,
    id,
  } = integration;
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <TokenLoginModal id={id} authenticate={authFlow.authenticate} opened={opened} onClose={() => setOpened(false)} />
      <Button
        className={classNames('login-button', id)}
        variant='contained'
        size='large'
        startIcon={<Icon className='base-icon' />}
        onClick={() => setOpened(true)}
      >
        {t(`integration.${id}.name`)}
      </Button>
    </>
  );
};

export default TokenLoginButton;
