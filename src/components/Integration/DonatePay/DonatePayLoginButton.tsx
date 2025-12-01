import { useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import RegionSelectModal from './RegionSelectModal.tsx';

import TokenFlow = Integration.TokenFlow;

interface DonatePayLoginButtonProps {
  integration: Integration.Config<TokenFlow>;
}

function DonatePayLoginButton({ integration }: DonatePayLoginButtonProps) {
  const {
    branding: { icon: Icon },
  } = integration;
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <RegionSelectModal opened={opened} onClose={() => setOpened(false)} />
      <Button
        className={classNames('login-button', 'donatePay')}
        variant="contained"
        size="large"
        startIcon={<Icon className="base-icon" />}
        onClick={() => setOpened(true)}
      >
        {t('integration.donatePay.name')}
      </Button>
    </>
  );
}

export default DonatePayLoginButton;

