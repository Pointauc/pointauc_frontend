import { Group } from '@mantine/core';
import { useWatch } from 'react-hook-form';

import RandomSpinConfig from '../../RandomSpinConfig';
import RandomSpinSwitch from '../../RandomSpinSwitch';
import SpinTimeField from '../../SpinTime';

const SpinTimeComposed = () => {
  const randomSpinEnabled = useWatch<Wheel.Settings>({ name: 'randomSpinEnabled' });

  return (
    <Group align='center' justify='space-between' gap='xs'>
      <Group>
        {!randomSpinEnabled && <SpinTimeField />}
        {randomSpinEnabled && <RandomSpinConfig />}
      </Group>
      <RandomSpinSwitch />
    </Group>
  );
};

export default SpinTimeComposed;
