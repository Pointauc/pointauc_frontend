import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, IconButton, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { useFormContext } from 'react-hook-form';

import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';
import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup';
import { COLORS } from '@constants/color.constants.ts';
import BackgroundSettings from '@pages/settings/AuctionSettings/Appearance/BackgroundSettings';

const AppearanceSettings = () => {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext();

  const resetPrimary = () => setValue('primaryColor', COLORS.THEME.PRIMARY, { shouldDirty: true, shouldTouch: true });
  const resetBackgroundTone = () =>
    setValue('backgroundTone', COLORS.THEME.BACKGROUND_TONE, { shouldDirty: true, shouldTouch: true });

  return (
    <SettingsGroup title={t('settings.appearance.appearance')}>
      <BackgroundSettings />
      <FormGroup row className='auc-settings-row'>
        <Typography variant='body1' className='MuiFormControlLabel-label'>
          {t('settings.appearance.primaryColor')}
        </Typography>
        <FormColorPicker control={control} name='primaryColor' />
        <IconButton className='auc-settings-reset-background' onClick={resetPrimary}>
          <ReplayIcon />
        </IconButton>
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <Typography variant='body1' className='MuiFormControlLabel-label'>
          {t('settings.appearance.backgroundTone')}
        </Typography>
        <FormColorPicker control={control} name='backgroundTone' />
        <IconButton className='auc-settings-reset-background' onClick={resetBackgroundTone}>
          <ReplayIcon />
        </IconButton>
      </FormGroup>
    </SettingsGroup>
  );
};

export default AppearanceSettings;
