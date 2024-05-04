import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormGroup } from '@mui/material';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import { closeTwitchRewards } from '@api/twitchApi.ts';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';
import RewardPresetsForm from '@components/IntegrationPage/TwitchIntegration/RewardPresetsForm.tsx';
import { RootState } from '@reducers';
import { integrationUtils } from '@components/Integration/helpers.ts';
import twitch from '@components/Integration/Twitch';
import { integrations } from '@components/Integration/integrations.ts';

import '@pages/settings/IntegrationsSettings/Points/PointsSettings.scss';

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
    <SettingsGroup className='points-settings' title={t('settings.points.points')}>
      {unavailable.map((integration) => (
        <integration.authFlow.loginComponent key={integration.id} integration={integration} />
      ))}
      {available.length > 0 && (
        <FormGroup className='auc-settings-list'>
          <div style={{ display: 'flex', marginBottom: 10 }}>
            <LoadingButton
              isLoading={loading}
              variant='outlined'
              color='primary'
              className={classNames('open-rewards-button', { close: actual })}
              onClick={toggleSubscribe}
            >
              {actual ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
            </LoadingButton>
            <Button
              variant='outlined'
              color='secondary'
              style={{ width: 175, marginLeft: 20 }}
              onClick={closeTwitchRewards}
            >
              {t('settings.twitch.deleteRewards')}
            </Button>
          </div>
          <FormGroup row className='auc-settings-row'>
            <FormSwitch name='isRefundAvailable' control={control} label={t('settings.twitch.returnCanceledBids')} />
          </FormGroup>
          <FormGroup row className='auc-settings-row'>
            <FormSwitch
              name='dynamicRewards'
              control={control}
              label={t('settings.twitch.bindRewardsToTimer')}
              hint={t('settings.twitch.bindRewardsToTimerDesc')}
            />
          </FormGroup>
          <RewardPresetsForm />
        </FormGroup>
      )}
    </SettingsGroup>
  );
};

export default PointsSettings;
