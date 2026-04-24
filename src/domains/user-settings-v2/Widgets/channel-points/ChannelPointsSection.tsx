import { Button, Divider, Group, Stack } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useStore } from '@tanstack/react-store';

import { closeTwitchRewards } from '@api/twitchApi.ts';
import twitch from '@domains/bids/external-integrations/Twitch';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';
import { RootState } from '@reducers';
import { SettingsForm } from '@models/settings.model.ts';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import PointsIcon from '@assets/icons/channelPoints.svg?react';

import RewardPresetsForm from './RewardPresetsForm';

const ChannelPointsSection = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
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
    <SettingsSection
      id='website-settings-channel-points'
      title={t('settings.website.toc.channelPoints')}
      icon={<PointsIcon width={24} height={24} />}
    >
      <Stack gap='md'>
        {unavailable.length > 0 && (
          <SettingsCard>
            <Stack gap='sm' p='md'>
              {unavailable.map((integration) => (
                <integration.authFlow.loginComponent
                  key={integration.id}
                  id={integration.id}
                  branding={integration.branding}
                />
              ))}
            </Stack>
          </SettingsCard>
        )}

        {available.length > 0 && (
          <SettingsCard>
            <Stack gap={0}>
              <SettingsRow>
                <Group justify='space-between' align='center' gap='md' wrap='wrap'>
                  <Group gap='sm' wrap='wrap'>
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
              </SettingsRow>

              {/* <Divider /> */}

              {/* <SettingsRow htmlFor='isRefundAvailable'>
                <FormSwitchField
                  name='isRefundAvailable'
                  control={control}
                  label={<FieldLabel text={t('settings.twitch.returnCanceledBids')} />}
                />
              </SettingsRow> */}

              <Divider />

              <SettingsRow compact htmlFor='dynamicRewards'>
                <FormSwitchField
                  name='dynamicRewards'
                  control={control}
                  label={
                    <FieldLabel
                      text={t('settings.twitch.bindRewardsToTimer')}
                      hint={t('settings.twitch.bindRewardsToTimerDesc')}
                    />
                  }
                />
              </SettingsRow>

              <Divider />

              <RewardPresetsForm />
            </Stack>
          </SettingsCard>
        )}
      </Stack>
    </SettingsSection>
  );
};

export default ChannelPointsSection;
