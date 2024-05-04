import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';

import '@pages/settings/AuctionSettings/Auction/AuctionSettings.scss';

const AuctionSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <SettingsGroup className='auction-settings' title={t('settings.auc.auc')}>
      <FormGroup row className='auc-settings-row'>
        <FormSwitch name='isTotalVisible' control={control} label={t('settings.auc.showTotal')} />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormSwitch name='showChances' control={control} label={t('settings.auc.showWinningChances')} />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormSwitch name='hideAmounts' control={control} label={t('settings.auc.hideAmounts')} />
      </FormGroup>
    </SettingsGroup>
  );
};

export default AuctionSettings;
