import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Stack } from '@mantine/core';
import { useFormContext } from 'react-hook-form';

import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch.tsx';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';

const AuctionSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <SettingsGroup title={t('settings.auc.auc')}>
      <Stack gap='sm'>
        <Group>
          <FormSwitch
            name='isTotalVisible'
            control={control}
            label={<SettingLabel text={t('settings.auc.showTotal')} />}
          />
        </Group>
        <Group>
          <FormSwitch
            name='showChances'
            control={control}
            label={<SettingLabel text={t('settings.auc.showWinningChances')} />}
          />
        </Group>
        <Group>
          <FormSwitch
            name='hideAmounts'
            control={control}
            label={<SettingLabel text={t('settings.auc.hideAmounts')} />}
          />
        </Group>
        <Group>
          <FormSwitch
            name='favoritesIsEnable'
            control={control}
            label={<SettingLabel text={t('settings.auc.favoritesIsEnable')} />}
          />
        </Group>
      </Stack>
    </SettingsGroup>
  );
};

export default AuctionSettings;
