import { FC } from 'react';
import { Stack, Switch, Slider, Text, Card } from '@mantine/core';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardSwitchLabel from './CardSwitchLabel';

const WheelSettings: FC = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <Stack gap='md'>
      <Stack gap='xs'>
        <Card withBorder padding='sm' radius='md'>
          <Controller
            name='settings.showParticipants'
            control={control}
            render={({ field }) => (
              <Switch
                label={<CardSwitchLabel text={t('overlays.settings.showParticipants')} />}
                size='md'
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Card>
        <Card withBorder padding='sm' radius='md'>
          <Controller
            name='settings.showWheel'
            control={control}
            render={({ field }) => (
              <Switch
                label={<CardSwitchLabel text={t('overlays.settings.showWheel')} />}
                size='md'
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Card>
      </Stack>

      <Stack gap='xs'>
        <Text size='sm' fw={500}>
          {t('overlays.settings.backgroundTransparency')}
        </Text>
        <Text size='xs' c='dimmed'>
          {t('overlays.settings.backgroundTransparencyDescriptionWheel')}
        </Text>
        <Controller
          name='settings.backgroundTransparency'
          control={control}
          render={({ field }) => (
            <Slider
              value={field.value}
              onChange={field.onChange}
              min={0}
              max={1}
              step={0.05}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
              ]}
            />
          )}
        />
      </Stack>
    </Stack>
  );
};

export default WheelSettings;
