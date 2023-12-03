import { useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DonatePaySvg from '@assets/icons/donatePay.svg?react';

import DonatePayLoginModal from './DonatePayLoginModal';
import './DonatePayLoginButton.scss';

const DonatePayLoginButton = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <DonatePayLoginModal opened={opened} onClose={() => setOpened(false)} />
      <Button
        className='login-button donatepay'
        variant='contained'
        size='large'
        startIcon={<DonatePaySvg className='base-icon donate-pay' />}
        onClick={() => setOpened(true)}
      >
        {t('common.connectDonatePay')}
      </Button>
    </>
  );
};

export default DonatePayLoginButton;
