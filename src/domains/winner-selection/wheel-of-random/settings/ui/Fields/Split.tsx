import { Group, Slider, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

const SplitField = () => {
  const { t } = useTranslation();

  return (
    <Group w='100%' gap='xs' mb='xs'>
      <Text fw={500}>{t('wheel.dividing')}</Text>
      <Controller
        render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
          <Slider
            style={{ flexGrow: 1 }}
            step={0.1}
            min={0.1}
            max={1}
            onChange={(value) => onChange(Number(value))}
            value={value}
            disabled={isSubmitting}
            marks={[
              { value: 0.1, label: `${t('common.max')} / 10` },
              { value: 1, label: t('common.max') },
            ]}
          />
        )}
        name='split'
      />
    </Group>
  );
};

export default SplitField;
