import { Stack } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import FormInput from '@shared/mantine/ui/Input/FormInput.tsx';

const MarblesSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const open = useWatch({ name: 'marblesAuc' });

  return (
    <SettingsGroup title={t('settings.marbles.marbles')} open={open} controlName='marblesAuc'>
      <Stack gap='sm'>
        <FormInput
          name='marbleRate'
          control={control}
          label={<SettingLabel text={t('settings.marbles.marbleCost')} hint={t('settings.marbles.marbleCostDesc')} />}
          type='number'
          size='sm'
          inputWidth='sm'
        />
        <FormInput
          name='marbleCategory'
          control={control}
          label={
            <SettingLabel
              text={t('settings.marbles.newPositionCost')}
              hint={t('settings.marbles.newPositionCostDesc')}
            />
          }
          type='number'
          size='sm'
          inputWidth='sm'
        />
      </Stack>
    </SettingsGroup>
  );
};

export default MarblesSettings;
