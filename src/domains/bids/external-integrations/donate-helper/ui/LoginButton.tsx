import { useState } from 'react';
import clsx from 'clsx';

import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton';
import * as Integration from '@models/integration';

import AuthModal from './AuthModal.tsx';
import styles from './LoginButton.module.css';

import TokenFlow = Integration.TokenFlow;

const DonateHelperLoginButton = ({ integration, classes }: Integration.LoginButtonProps<TokenFlow>) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <AuthModal opened={opened} onClose={() => setOpened(false)} />
      <IntegrationLoginButton
        integration={integration}
        onClick={() => setOpened(true)}
        classes={{ ...classes, button: clsx(styles.loginButton, classes?.button) }}
      />
    </>
  );
};

export default DonateHelperLoginButton;
