import { Group } from '@mantine/core';
import { useWatch } from 'react-hook-form';

import RandomSpinConfig from '../../RandomSpinConfig';
import RandomSpinSwitch from '../../RandomSpinSwitch';
import SpinTimeField from '../../SpinTime';

interface SpinTimeComposedProps {
  disabled?: boolean;
}

const SpinTimeComposed = ({ disabled }: SpinTimeComposedProps) => {
  const randomSpinEnabled = useWatch<Wheel.Settings>({ name: 'randomSpinEnabled' });

  return (
    <Group align='center' justify='space-between' gap='xs'>
      <Group>
        {!randomSpinEnabled && <SpinTimeField />}
        {randomSpinEnabled && <RandomSpinConfig />}
      </Group>
      {!disabled && <RandomSpinSwitch />}
    </Group>
  );
};

export default SpinTimeComposed;
