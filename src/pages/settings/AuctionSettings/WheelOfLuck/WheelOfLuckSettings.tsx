import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormGroup } from '@mui/material';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';

const WheelOfLuckSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const open = useWatch({ name: 'luckyWheelEnabled' });

  return (
    <SettingsGroup
      title={t('settings.luckyWheel.luckyWheel')}
      controlName='luckyWheelEnabled'
      hint={t('settings.luckyWheel.desc')}
      open={open}
    >
      <FormGroup row className='auc-settings-row'>
        <FormSwitch name='luckyWheelSelectBet' control={control} label={t('settings.luckyWheel.selectBet')} />
      </FormGroup>
    </SettingsGroup>
  );
};

export default WheelOfLuckSettings;
