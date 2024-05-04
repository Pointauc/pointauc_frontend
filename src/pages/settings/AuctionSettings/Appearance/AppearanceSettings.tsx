import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, IconButton, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { useFormContext } from 'react-hook-form';

import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';
import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup';
import { COLORS } from '@constants/color.constants.ts';
import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput.tsx';
import ImagePresetsInput from '@components/Form/ImagePresetsInput/ImagePresetsInput.tsx';
import { BACKGROUND_PRESETS } from '@constants/common.constants.ts';

const AppearanceSettings = () => {
  const { t } = useTranslation();
  const { setValue, register, control } = useFormContext();

  const resetPrimary = () => setValue('primaryColor', COLORS.THEME.PRIMARY, { shouldDirty: true, shouldTouch: true });
  const resetBackgroundTone = () =>
    setValue('backgroundTone', COLORS.THEME.BACKGROUND_TONE, { shouldDirty: true, shouldTouch: true });

  useEffect(() => {
    register('background');
  }, [register]);

  const handleImageChange = (image: string): void => {
    setValue('background', image, { shouldDirty: true });
  };

  const resetBackground = (): void => {
    setValue('background', null, { shouldDirty: true });
  };

  return (
    <SettingsGroup title={t('settings.appearance.appearance')}>
      <FormGroup row className='auc-settings-row'>
        <Typography variant='body1' className='MuiFormControlLabel-label'>
          {t('settings.auc.background')}
        </Typography>
        <ImageLinkInput
          buttonTitle={t('settings.auc.uploadBackground')}
          buttonClass='upload-background'
          onChange={handleImageChange}
        />
        <ImagePresetsInput
          images={BACKGROUND_PRESETS}
          buttonTitle={t('settings.auc.selectFromList')}
          onChange={handleImageChange}
        />
        <IconButton className='auc-settings-reset-background' onClick={resetBackground}>
          <ReplayIcon />
        </IconButton>
      </FormGroup>
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
