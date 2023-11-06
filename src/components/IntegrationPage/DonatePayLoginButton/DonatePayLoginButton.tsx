import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DonatePayLoginModal from './DonatePayLoginModal';
import { ReactComponent as DonatePaySvg } from '../../../assets/icons/donatePay.svg';
import './DonatePayLoginButton.scss';

const DonatePayLoginButton = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <DonatePayLoginModal opened={opened} onClose={() => setOpened(false)} />
      <Button
        className="login-button donatepay"
        variant="contained"
        size="large"
        startIcon={<DonatePaySvg className="base-icon donate-pay" />}
        onClick={() => setOpened(true)}
      >
        {t('common.connectDonatePay')}
      </Button>
    </>
  );
};

export default DonatePayLoginButton;
