import { useState } from 'react';

import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import * as Integration from '@models/integration';
import styles from '@domains/bids/external-integrations/DonatePay/ui/LoginButton/index.module.css';

import RegionSelectModal from '../../RegionSelectModal.tsx';

import TokenFlow = Integration.TokenFlow;

interface DonatePayLoginButtonProps {
  integration: Integration.Config<TokenFlow>;
}

function DonatePayLoginButton({ integration }: DonatePayLoginButtonProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <RegionSelectModal opened={opened} onClose={() => setOpened(false)} />
      <IntegrationLoginButton
        integration={integration}
        onClick={() => setOpened(true)}
        classes={{ button: styles.button, icon: styles.icon }}
      />
    </>
  );
}

export default DonatePayLoginButton;
