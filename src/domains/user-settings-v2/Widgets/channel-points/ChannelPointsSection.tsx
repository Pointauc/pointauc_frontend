import { Button, Divider } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useStore } from '@tanstack/react-store';

import { vkVideoLiveRewardsApi } from '@api/vkVideoLiveApi';
import { closeTwitchRewards } from '@api/twitchApi.ts';
import { closeKickRewards } from '@api/kickApi';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';
import { RootState } from '@reducers';
import { SettingsForm } from '@models/settings.model.ts';
import * as Integration from '@models/integration';
import { store } from '@store';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import PointsIcon from '@assets/icons/channelPoints.svg?react';

import RewardPresetsForm from './RewardPresetsForm';

interface PointsIntegrationControlsProps {
  integration: Integration.Config;
}

const deleteRewards = async (integration: Integration.Config): Promise<void> => {
  if (integration.id === 'twitch') {
    await closeTwitchRewards();
    return;
  }

  if (integration.id === 'vkVideoLive') {
    const vkChannelUrl = store.getState().user.authData.vkVideoLive?.channelUrl;

    if (vkChannelUrl) {
      await vkVideoLiveRewardsApi.deleteRewards(vkChannelUrl);
    }
  }

  if (integration.id === 'kick') {
    await closeKickRewards();
  }
};

const PointsIntegrationControls = ({ integration }: PointsIntegrationControlsProps) => {
  const { t } = useTranslation();
  const { subscribed, loading: pubsubLoading } = useStore(integration.pubsubFlow.store, (state) => state);
  const Icon = integration.branding.icon;

  const toggleSubscribe = useCallback((): void => {
    if (subscribed) {
      integration.pubsubFlow.disconnect();
    } else {
      integration.pubsubFlow.connect();
    }
  }, [integration, subscribed]);

  const handleDeleteRewards = useCallback(() => {
    deleteRewards(integration);
  }, [integration]);

  return (
    <SettingsRow>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Icon />
          <span className='text-sm font-medium'>{t(`integration.${integration.id}.name`)}</span>
        </div>
        <div className='flex flex-wrap items-center gap-2.5'>
          <Button
            loading={pubsubLoading}
            variant='outline'
            size='sm'
            color={subscribed ? 'white' : undefined}
            onClick={toggleSubscribe}
          >
            {subscribed ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
          </Button>
          <Button variant='outline' color='red' size='sm' onClick={handleDeleteRewards}>
            {t('settings.twitch.deleteRewards')}
          </Button>
          <RevokeIntegrationButton revoke={integration.authFlow.revoke} />
        </div>
      </div>
    </SettingsRow>
  );
};

const ChannelPointsSection = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const authData = useSelector((root: RootState) => root.user.authData);

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
      <div className='flex flex-col gap-2'>
        {unavailable.length > 0 && (
          <SettingsCard>
            <div className='grid grid-cols-4 gap-2.5 p-4'>
              {unavailable.map((integration) => (
                <integration.authFlow.loginComponent
                  key={integration.id}
                  id={integration.id}
                  branding={integration.branding}
                />
              ))}
            </div>
          </SettingsCard>
        )}

        {available.length > 0 && (
          <SettingsCard>
            <div className='flex flex-col'>
              {available.map((integration, index) => (
                <div key={integration.id}>
                  <PointsIntegrationControls integration={integration} />
                  {index < available.length - 1 && <Divider />}
                </div>
              ))}

              {/* <Divider /> */}

              {/* <SettingsRow htmlFor='isRefundAvailable'>
                <FormSwitchField
                  name='isRefundAvailable'
                  control={control}
                  label={<FieldLabel text={t('settings.twitch.returnCanceledBids')} />}
                />
              </SettingsRow> */}

              <Divider />

              <SettingsRow compact htmlFor='dynamicRewards' description={t('settings.twitch.bindRewardsToTimerDesc')}>
                <FormSwitchField
                  name='dynamicRewards'
                  control={control}
                  label={<FieldLabel text={t('settings.twitch.bindRewardsToTimer')} withDescriptionIcon />}
                />
              </SettingsRow>

              <Divider />

              <RewardPresetsForm />
            </div>
          </SettingsCard>
        )}
      </div>
    </SettingsSection>
  );
};

export default ChannelPointsSection;
