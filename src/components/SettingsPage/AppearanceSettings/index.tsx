import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { FormGroup, IconButton, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle.tsx';
import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';
import { COLORS } from '@constants/color.constants.ts';

const AppearanceSettings: FC = () => {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext();

  const resetPrimary = () => setValue('primaryColor', COLORS.THEME.PRIMARY, { shouldDirty: true, shouldTouch: true });
  const resetBackgroundTone = () =>
    setValue('backgroundTone', COLORS.THEME.BACKGROUND_TONE, { shouldDirty: true, shouldTouch: true });

  return (
    <>
      <SettingsGroupTitle title={t('settings.appearance.appearance')} />
      <FormGroup className='auc-settings-list'>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.appearance.primaryColor')}
          </Typography>
          <FormColorPicker control={control} name='primaryColor' />
          <IconButton className='auc-settings-reset-background' onClick={resetPrimary} size='large'>
            <ReplayIcon />
          </IconButton>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.appearance.backgroundTone')}
          </Typography>
          <FormColorPicker control={control} name='backgroundTone' />
          <IconButton className='auc-settings-reset-background' onClick={resetBackgroundTone} size='large'>
            <ReplayIcon />
          </IconButton>
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default AppearanceSettings;
