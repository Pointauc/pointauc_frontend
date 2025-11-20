import { Button, Group, Stack } from '@mantine/core';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { closeTwitchRewards } from '@api/twitchApi.ts';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { integrations } from '@components/Integration/integrations.ts';
import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';
import RewardPresetsForm from '@pages/settings/IntegrationsSettings/Points/TwitchIntegration/RewardPresetsForm';
import { RootState } from '@reducers';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch';

const PointsSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const authData = useSelector((root: RootState) => root.user.authData);
  const {
    twitch: { actual, loading },
  } = useSelector((root: RootState) => root.subscription);

  const toggleSubscribe = useCallback((): void => {
    integrationUtils.setSubscribeState(twitch, !actual);
  }, [actual]);
  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.points, authData),
    [authData],
  );

  return (
    <SettingsGroup title={t('settings.points.points')}>
      {unavailable.map((integration) => (
        <integration.authFlow.loginComponent key={integration.id} integration={integration} />
      ))}
      {available.length > 0 && (
        <Stack gap='sm'>
          <Group justify='space-between'>
            <Group gap='sm'>
              <Button
                loading={loading}
                variant='outline'
                size='sm'
                color={actual ? 'white' : undefined}
                onClick={toggleSubscribe}
              >
                {actual ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
              </Button>
              <Button variant='outline' color='red' size='sm' onClick={closeTwitchRewards}>
                {t('settings.twitch.deleteRewards')}
              </Button>
            </Group>
            <RevokeIntegrationButton revoke={available[0].authFlow.revoke} />
          </Group>
          <FormSwitch
            name='isRefundAvailable'
            control={control}
            label={<SettingLabel size='lg' text={t('settings.twitch.returnCanceledBids')} />}
          />
          <FormSwitch
            name='dynamicRewards'
            control={control}
            label={
              <SettingLabel
                size='lg'
                text={t('settings.twitch.bindRewardsToTimer')}
                hint={t('settings.twitch.bindRewardsToTimerDesc')}
              />
            }
          />
          <RewardPresetsForm />
        </Stack>
      )}
    </SettingsGroup>
  );
};

export default PointsSettings;
