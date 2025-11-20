import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Group } from '@mantine/core';

import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch.tsx';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';

const WheelOfLuckSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const open = useWatch({ name: 'luckyWheelEnabled' });

  return (
    <SettingsGroup
      title={t('settings.luckyWheel.groupTitle')}
      hint={t('settings.luckyWheel.desc')}
      controlName='luckyWheelEnabled'
      open={open}
    >
      <Group className='auc-settings-row'>
        <FormSwitch
          name='luckyWheelSelectBet'
          control={control}
          label={<SettingLabel text={t('settings.luckyWheel.selectBet')} />}
        />
      </Group>
    </SettingsGroup>
  );
};

export default WheelOfLuckSettings;
