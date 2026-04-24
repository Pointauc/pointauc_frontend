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

  const [localOpacity, setLocalOpacity] = useState(Math.round((opacity.field.value ?? 0) * 100));
  const [localBlur, setLocalBlur] = useState(blur.field.value ?? 0);

  const saveOpacity = (value: number): void => {
    opacity.field.onChange(value / 100);
    opacity.field.onBlur();
  };

  const saveBlur = (value: number): void => {
    blur.field.onChange(value);
    blur.field.onBlur();
  };

  useEffect(() => {
    setLocalOpacity(Math.round((opacity.field.value ?? 0) * 100));
    setLocalBlur(blur.field.value ?? 0);
  }, [opacity.field.value, blur.field.value]);

  return (
    <div>
      <SettingsRow nested htmlFor='backgroundOverlayOpacity'>
        <Grid align='center'>
          <Grid.Col span={{ base: 12, sm: 4 }} style={{ display: 'flex', alignItems: 'center' }}>
            <Text size='sm'>{t('settings.auc.backgroundOverlayOpacity')}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 8 }} style={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              id='backgroundOverlayOpacity'
              value={localOpacity}
              onChange={setLocalOpacity}
              onChangeEnd={saveOpacity}
              label={(value) => `${value}%`}
              min={0}
              max={100}
              marks={null as any}
              w='100%'
            />
          </Grid.Col>
        </Grid>
      </SettingsRow>

      <Divider />

      <SettingsRow nested htmlFor='backgroundBlur'>
        <Grid align='center'>
          <Grid.Col span={{ base: 12, sm: 4 }} style={{ display: 'flex', alignItems: 'center' }}>
            <Text size='sm'>{t('settings.auc.backgroundBlur')}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 8 }} style={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              id='backgroundBlur'
              value={localBlur}
              onChange={setLocalBlur}
              onChangeEnd={saveBlur}
              label={(value) => `${Math.round((value * 100) / 30)}%`}
              min={0}
              max={30}
              marks={null as any}
              w='100%'
            />
          </Grid.Col>
        </Grid>
      </SettingsRow>
    </div>
  );
};

export default CustomBackgroundSettings;
