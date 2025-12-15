import { Group, Slider, Text } from '@mantine/core';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  maxDepth?: number;
}

const Nesting = ({ maxDepth }: Props) => {
  const { t } = useTranslation();
  return (
    <Group w='100%' gap='xs' mb='xs'>
      <Text fw={500}>{t('wheel.nesting')}</Text>
      <Controller
        render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
          <Slider
            style={{ flexGrow: 1 }}
            step={1}
            min={1}
            max={maxDepth || 1}
            onChange={(value) => onChange(value as number)}
            value={value || 1}
            marks={[
              { value: maxDepth || 1, label: maxDepth },
              { value: 1, label: '1' },
            ]}
            disabled={isSubmitting}
          />
        )}
        name='depthRestriction'
      />
    </Group>
  );
};

export default Nesting;
