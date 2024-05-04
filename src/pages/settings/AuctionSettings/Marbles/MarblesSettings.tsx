import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import FormInput from '@components/Form/FormInput/FormInput.tsx';
import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';

const MarblesSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const open = useWatch({ name: 'marblesAuc' });

  return (
    <SettingsGroup title={t('settings.marbles.marbles')} open={open} controlName='marblesAuc'>
      <FormGroup row className='auc-settings-row'>
        <FormInput
          name='marbleRate'
          control={control}
          label={t('settings.marbles.marbleCost')}
          type='number'
          className='field md'
          hint={t('settings.marbles.marbleCostDesc')}
        />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormInput
          name='marbleCategory'
          control={control}
          label={t('settings.marbles.newPositionCost')}
          type='number'
          className='field md'
          hint={t('settings.marbles.newPositionCostDesc')}
        />
      </FormGroup>
    </SettingsGroup>
  );
};

export default MarblesSettings;
