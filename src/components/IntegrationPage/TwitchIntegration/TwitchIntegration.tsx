import React, { FC, useCallback, useState } from 'react';
import { Button, FormGroup } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '../../../reducers';
import './TwitchIntegration.scss';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import { sendCpSubscribedState } from '../../../reducers/Subscription/Subscription';
import LoadingButton from '../../LoadingButton/LoadingButton';
import { closeTwitchRewards } from '../../../api/twitchApi';
import TwitchLoginButton from '../TwitchLoginButton/TwitchLoginButton';
import RewardPresetsForm from './RewardPresetsForm';

interface TwitchIntegrationProps {
  control: UseFormMethods['control'];
}

const TwitchIntegration: FC<TwitchIntegrationProps> = ({ control }) => {
  const dispatch = useDispatch();
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
      <SettingsGroupTitle title="Twitch">
        {hasTwitchAuth && <span className="username">{username}</span>}
      </SettingsGroupTitle>
      {username && hasTwitchAuth ? (
        <FormGroup className="auc-settings-list">
          <div style={{ display: 'flex', marginBottom: 10 }}>
            <LoadingButton
              isLoading={loading}
              variant="outlined"
              color="primary"
              className={classNames('open-rewards-button', { close: actual })}
              onClick={toggleSubscribe}
            >
              {actual ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
            </LoadingButton>
            <Button
              variant="outlined"
              color="secondary"
              style={{ width: 175, marginLeft: 20 }}
              onClick={closeTwitchRewards}
            >
              {t('settings.twitch.deleteRewards')}
            </Button>
          </div>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="alwaysAddNew" control={control} label={t('settings.addNewBids')} />
          </FormGroup>
          <div className="hint">Не рекомендуется для обычных аукционов!</div>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="isRefundAvailable" control={control} label={t('settings.twitch.returnCanceledBids')} />
          </FormGroup>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="dynamicRewards" control={control} label={t('settings.twitch.bindRewardsToTimer')} />
          </FormGroup>
          <div className="hint">{t('settings.twitch.bindRewardsToTimerDesc')}</div>
          <RewardPresetsForm />
        </FormGroup>
      ) : (
        <TwitchLoginButton />
      )}
    </div>
  );
};

export default TwitchIntegration;
