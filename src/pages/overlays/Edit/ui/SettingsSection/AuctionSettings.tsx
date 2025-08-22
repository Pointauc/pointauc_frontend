import { Card, Collapse, Divider, Slider, Stack, Switch, Text } from '@mantine/core';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardSwitchLabel from './CardSwitchLabel';

const AuctionSettings: FC = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <Stack gap='md'>
      <Stack gap='xs'>
        {/* Rules card */}
        <Card withBorder padding='sm' radius='md' shadow='sm'>
          <Controller
            name='settings.showRules'
            control={control}
            render={({ field }) => (
              <Switch
                label={<CardSwitchLabel text={t('overlays.settings.showRules')} />}
                size='md'
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Card>

        {/* Table card with inner settings */}
        <Card withBorder padding='sm' radius='md' shadow='sm'>
          <Controller
            name='settings.showTable'
            control={control}
            render={({ field }) => (
              <Switch
                label={<CardSwitchLabel text={t('overlays.settings.showTable')} />}
                size='md'
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name='settings.showTable'
            control={control}
            render={({ field: tableField }) => (
              <Collapse in={!!tableField.value} transitionDuration={150}>
                <Divider my='sm' />
                <Stack gap='sm'>
                  {/* Autoscroll toggle */}
                  <Controller
                    name='settings.autoscroll'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        label={t('overlays.settings.autoscroll')}
                        size='md'
                        checked={!!field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {/* Autoscroll speed slider (only when autoscroll enabled) */}
                  <Stack gap='xs' mt='xs'>
                    <Text size='xs' c='dimmed'>
                      {t('overlays.settings.autoscrollSpeed')}
                    </Text>
                    <Controller
                      name='settings.autoscrollSpeed'
                      control={control}
                      render={({ field }) => (
                        <Slider
                          mb='md'
                          value={field.value ?? 50}
                          onChange={field.onChange}
                          min={0}
                          max={100}
                          step={5}
                          marks={[
                            { value: 0, label: t('overlays.settings.speedSlow') },
                            { value: 50, label: t('overlays.settings.speedMedium') },
                            { value: 100, label: t('overlays.settings.speedFast') },
                          ]}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </Collapse>
            )}
          />
        </Card>

        {/* Timer card */}
        <Card withBorder padding='sm' radius='md' shadow='sm'>
          <Controller
            name='settings.showTimer'
            control={control}
            render={({ field }) => (
              <Switch
                label={<CardSwitchLabel text={t('overlays.settings.showTimer')} />}
                size='md'
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Card>
      </Stack>

      <Divider />

      <Stack gap='xs'>
        <Text size='sm' fw={500}>
          {t('overlays.settings.backgroundTransparency')}
        </Text>
        <Text size='xs' c='dimmed'>
          {t('overlays.settings.backgroundTransparencyDescription')}
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

export default AuctionSettings;
