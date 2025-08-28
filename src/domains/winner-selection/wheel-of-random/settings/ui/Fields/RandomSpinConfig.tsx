import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Group, Text } from '@mantine/core';

import OutlineInput from '@shared/mantine/ui/Input/OutlineInput';

const RandomSpinConfig = () => {
  const { t } = useTranslation();

  return (
    <Group align='end' gap='xs'>
      <Controller
        name='randomSpinConfig.min'
        render={({ field: { onChange, value } }) => (
          <OutlineInput
            w={70}
            label={t('common.from')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Text className='wheel-controls-tip wheel-controls-input-delimiter'>–</Text>
      <Controller
        name='randomSpinConfig.max'
        render={({ field: { onChange, value } }) => (
          <OutlineInput
            w={70}
            label={t('common.to')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Text className='wheel-controls-tip'>{t('common.sec')}</Text>
    </Group>
  );
};

export default RandomSpinConfig;
