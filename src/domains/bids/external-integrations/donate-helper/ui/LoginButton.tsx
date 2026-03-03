import { useState } from 'react';
import clsx from 'clsx';

import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton';
import * as Integration from '@models/integration';

import AuthModal from './AuthModal.tsx';
import styles from './LoginButton.module.css';

const DonateHelperLoginButton = ({ id, branding, classes }: Integration.LoginButtonProps) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <AuthModal opened={opened} onClose={() => setOpened(false)} />
      <IntegrationLoginButton
        id={id}
        branding={branding}
        onClick={() => setOpened(true)}
        classes={{ ...classes, button: clsx(styles.loginButton, classes?.button) }}
      />
    </>
  );
};

export default DonateHelperLoginButton;
