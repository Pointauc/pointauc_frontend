import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { FormGroup, Typography } from '@mui/material';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle.tsx';
import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';

interface Props {
  control: UseFormReturn['control'];
}

const AppearanceSettings: FC<Props> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <>
      <SettingsGroupTitle title={t('settings.appearance.appearance')} />
      <FormGroup className='auc-settings-list'>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.appearance.primaryColor')}
          </Typography>
          <FormColorPicker control={control} name='primaryColor' />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.appearance.backgroundTone')}
          </Typography>
          <FormColorPicker control={control} name='backgroundTone' />
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default AppearanceSettings;
