import { Button, Group, Stack } from '@mantine/core';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useStore } from '@tanstack/react-store';

import { closeTwitchRewards } from '@api/twitchApi.ts';
import twitch from '@domains/bids/external-integrations/Twitch';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
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
  const { subscribed, loading: pubsubLoading } = useStore(twitch.pubsubFlow.store, (state) => state);

  const toggleSubscribe = useCallback((): void => {
    if (subscribed) {
      twitch.pubsubFlow.disconnect();
    } else {
      twitch.pubsubFlow.connect();
    }
  }, [subscribed]);
  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.points, authData),
    [authData],
  );

  return (
    <SettingsGroup title={t('settings.points.points')}>
      {unavailable.map((integration) => (
        <integration.authFlow.loginComponent key={integration.id} id={integration.id} branding={integration.branding} />
      ))}
      {available.length > 0 && (
        <Stack gap='sm'>
          <Group justify='space-between'>
            <Group gap='sm'>
              <Button
                loading={pubsubLoading}
                variant='outline'
                size='sm'
                color={subscribed ? 'white' : undefined}
                onClick={toggleSubscribe}
              >
                {subscribed ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
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
