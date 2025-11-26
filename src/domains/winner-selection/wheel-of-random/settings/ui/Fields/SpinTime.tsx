import { Controller } from 'react-hook-form';
import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import OutlineInput from '@shared/mantine/ui/Input/Outline/OutlineInput';

const SpinTimeField = () => {
  const { t } = useTranslation();
  return (
    <Group align='end' gap='xs'>
      <Controller
        name='spinTime'
        render={({ field: { onChange, value } }) => (
          <OutlineInput
            w={120}
            label={t('wheel.duration')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Text className='wheel-controls-tip'>с.</Text>
    </Group>
  );
};

export default SpinTimeField;
