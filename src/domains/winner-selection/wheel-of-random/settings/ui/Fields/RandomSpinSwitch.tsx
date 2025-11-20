import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconDice5Filled } from '@tabler/icons-react';

const RandomSpinSwitch = () => {
  const { field } = useController({ name: 'randomSpinEnabled' });
  const { t } = useTranslation();

  return (
    <Tooltip label={t('wheel.randomSpin')}>
      <ActionIcon
        onClick={() => field.onChange(!field.value)}
        onBlur={field.onBlur}
        size='xl'
        radius='md'
        variant={field.value ? 'filled' : 'outline'}
      >
        <IconDice5Filled size={28} />
      </ActionIcon>
    </Tooltip>
  );
};

export default RandomSpinSwitch;
