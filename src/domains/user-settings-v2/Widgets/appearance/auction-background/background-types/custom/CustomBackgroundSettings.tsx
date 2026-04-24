import { Divider, Grid, Slider, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { SettingsForm } from '@models/settings.model.ts';

const CustomBackgroundSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();

  const opacity = useController({ control, name: 'backgroundOverlayOpacity' });
  const blur = useController({ control, name: 'backgroundBlur' });

  return (
    <>
      <SettingsRow nested htmlFor='backgroundOverlayOpacity'>
        <div className='flex w-full items-center justify-between gap-4'>
          <div>
            <Text size='sm'>{t('settings.auc.backgroundOverlayOpacity')}</Text>
          </div>
          <div>
            <Slider
              id='backgroundOverlayOpacity'
              value={Math.round((opacity.field.value ?? 0) * 100)}
              onChange={(value) => {
                opacity.field.onChange(value / 100);
              }}
              onChangeEnd={() => {
                opacity.field.onBlur();
              }}
              label={(value) => `${value}%`}
              min={0}
              max={100}
              marks={null as any}
              w='352'
              step={1}
            />
          </div>
        </div>
      </SettingsRow>

      <Divider />

      <SettingsRow nested htmlFor='backgroundBlur'>
        <div className='flex w-full items-center justify-between gap-4'>
          <div>
            <Text size='sm'>{t('settings.auc.backgroundBlur')}</Text>
          </div>
          <div>
            <Slider
              id='backgroundBlur'
              value={((blur.field.value ?? 0) * 100) / 30}
              onChange={(value) => {
                blur.field.onChange((value * 30) / 100);
              }}
              onChangeEnd={() => {
                blur.field.onBlur();
              }}
              label={(value) => `${Math.round(value)}%`}
              min={0}
              max={100}
              marks={null as any}
              w='352'
              step={1}
            />
          </div>
        </div>
      </SettingsRow>
    </>
  );
};

export default CustomBackgroundSettings;
