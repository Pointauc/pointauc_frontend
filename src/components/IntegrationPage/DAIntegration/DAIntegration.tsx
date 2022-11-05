import React, { FC, useCallback, useState } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, Switch, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../reducers';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import './DAIntegration.scss';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import FormInput from '../../Form/FormInput/FormInput';
import { sendDaSubscribedState } from '../../../reducers/Subscription/Subscription';
import DALoginButton from '../DALoginButton/DALoginButton';

interface DaIntegration {
  control: UseFormMethods['control'];
}

const DaIntegration: FC<DaIntegration> = ({ control }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { hasDAAuth } = useSelector((root: RootState) => root.user);
  const {
    da: { actual, loading },
  } = useSelector((root: RootState) => root.subscription);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(actual);

  const handleSwitchChange = useCallback(
    (e: any, checked: boolean): void => {
      setIsSubscribed(checked);
      dispatch(sendDaSubscribedState(checked));
    },
    [dispatch],
  );

  return (
    <>
      <SettingsGroupTitle title="Donation Alerts">
        <Switch onChange={handleSwitchChange} disabled={!hasDAAuth || loading} checked={isSubscribed} />
      </SettingsGroupTitle>
      {hasDAAuth ? (
        <FormGroup>
          <FormGroup row className="auc-settings-row">
            <FormInput
              name="da.pointsRate"
              control={control}
              label={t('settings.donations.pointsRate')}
              type="number"
              className="field md"
            />
          </FormGroup>
          <FormGroup row className="auc-settings-row">
            <FormSwitch
              name="da.isIncrementActive"
              control={control}
              label={t('settings.donations.addTimeOnDonation')}
            />
            <FormInput name="da.incrementTime" className="field sm" control={control} type="number" />
            <Typography variant="body1">{t('common.sec')}</Typography>
          </FormGroup>
        </FormGroup>
      ) : (
        <DALoginButton />
      )}
    </>
  );
};

export default DaIntegration;
