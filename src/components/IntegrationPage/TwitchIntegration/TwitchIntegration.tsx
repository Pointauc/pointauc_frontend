import { FC, useCallback, useState } from 'react';
import { Button, FormGroup } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { Control } from 'react-hook-form';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '@reducers';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';
import { sendCpSubscribedState } from '@reducers/Subscription/Subscription.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton';
import { closeTwitchRewards } from '@api/twitchApi.ts';

import TwitchLoginButton from '../TwitchLoginButton/TwitchLoginButton';

import RewardPresetsForm from './RewardPresetsForm';

import './TwitchIntegration.scss';

interface TwitchIntegrationProps {
  control: Control;
}

const TwitchIntegration: FC<TwitchIntegrationProps> = ({ control }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { username, hasTwitchAuth } = useSelector((root: RootState) => root.user);
  const {
    twitch: { actual, loading },
  } = useSelector((root: RootState) => root.subscription);
  const [, setIsSubscribed] = useState<boolean>(actual);

  const toggleSubscribe = useCallback((): void => {
    setIsSubscribed((checked) => {
      dispatch(sendCpSubscribedState(!checked));

      return !checked;
    });
  }, [dispatch]);

  return (
    <div style={{ marginBottom: 20 }}>
      <SettingsGroupTitle title='Twitch'>
        {hasTwitchAuth && <span className='username'>{username}</span>}
      </SettingsGroupTitle>
      {username && hasTwitchAuth ? (
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
            <FormSwitch
              name='alwaysAddNew'
              control={control}
              label={t('settings.addNewBids')}
              hint='Не рекомендуется для обычных аукционов!'
            />
          </FormGroup>
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
      ) : (
        <TwitchLoginButton />
      )}
    </div>
  );
};

export default TwitchIntegration;
