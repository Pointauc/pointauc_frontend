import { Code, Group, Select, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { CANVAS_RESOLUTIONS, buildTransform } from '../../../../lib/canvas';

const CanvasResolutionSelector: FC = () => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext();

  const selectData = CANVAS_RESOLUTIONS.map((resolution) => ({
    value: `${resolution.value.width}x${resolution.value.height}`,
    label: resolution.label,
  }));

  return (
    <Controller
      name='canvasResolution'
      control={control}
      render={({ field }) => {
        return (
          <Group gap='xs' align='center'>
            <Tooltip
              label={
                <Trans
                  i18nKey='overlays.canvasResolution.tooltip'
                  components={{
                    1: <Code color='dark.0' />,
                  }}
                />
              }
              multiline
              w={300}
              position='bottom'
              withArrow
            >
              <Group gap='xs' align='center'>
                <Text size='sm' fw={500}>
                  {t('overlays.canvasResolution.label')}
                </Text>
                <IconInfoCircle size={20} color='var(--mantine-color-dimmed)' />
              </Group>
            </Tooltip>
            <Select
              value={`${field.value.width}x${field.value.height}`}
              onChange={(newValue) => {
                if (newValue) {
                  const [width, height] = newValue.split('x').map(Number);
                  field.onChange({ width, height });
                  setValue('transform', buildTransform({ canvasResolution: { width, height } }));
                }
              }}
              data={selectData}
              size='sm'
              style={{ minWidth: 240 }}
              clearable={false}
            />
          </Group>
        );
      }}
    />
  );
};

export default CanvasResolutionSelector;
