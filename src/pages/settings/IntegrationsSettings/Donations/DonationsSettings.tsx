import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { Group, Stack, Text } from '@mantine/core';

import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import { RootState } from '@reducers';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { integrations } from '@components/Integration/integrations.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import ExchangeRate from '@pages/settings/IntegrationsSettings/Donations/ExchangeRate';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';
import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import FormInput from '@shared/mantine/ui/Input/FormInput';

const DonationsSettings = () => {
  const { t } = useTranslation();
  const authData = useSelector((root: RootState) => root.user.authData);
  const { control } = useFormContext();

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.donate, authData),
    [authData],
  );

  return (
    <SettingsGroup title={t('settings.donations.donations')}>
      <Stack gap='md'>
        {available.map((integration) => (
          <Group justify='space-between' key={integration.id}>
            <PubsubSwitch integration={integration} />
            <RevokeIntegrationButton revoke={integration.authFlow.revoke} />
          </Group>
        ))}
        {unavailable.length > 0 && (
          <Group gap='md'>
            {unavailable.map((integration) => (
              <integration.authFlow.loginComponent key={integration.id} integration={integration} />
            ))}
          </Group>
        )}
        {available.length > 0 && (
          <Stack gap='sm'>
            <ExchangeRate />
            <Group className='auc-settings-row'>
              <FormSwitch
                name='isIncrementActive'
                control={control}
                label={<SettingLabel text={t('settings.donations.addTimeOnDonation')} />}
              />
              <FormInput
                name='incrementTime'
                control={control}
                type='number'
                inputWidth='sm'
                rightSection={<Text>{t('common.sec')}</Text>}
              />
            </Group>
          </Stack>
        )}
      </Stack>
    </SettingsGroup>
  );
};

export default DonationsSettings;
