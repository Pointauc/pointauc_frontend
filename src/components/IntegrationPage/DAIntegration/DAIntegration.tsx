import React, { FC } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../reducers';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import './DAIntegration.scss';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import FormInput from '../../Form/FormInput/FormInput';
import { sendDaSubscribedState, sendDonatePaySubscribedState } from '../../../reducers/Subscription/Subscription';
import DALoginButton from '../DALoginButton/DALoginButton';
import IntegrationSwitch from '../../IntegrationSwitch/IntegrationSwitch';
import DonatePayLoginButton from '../DonatePayLoginButton/DonatePayLoginButton';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import { ReactComponent as DonatePaySvg } from '../../../assets/icons/donatePay.svg';

interface DaIntegration {
  control: UseFormMethods['control'];
}

const DaIntegration: FC<DaIntegration> = ({ control }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { hasDAAuth, hasDonatPayAuth } = useSelector((root: RootState) => root.user);
  const { da, donatePay } = useSelector((root: RootState) => root.subscription);

  return (
    <>
      <SettingsGroupTitle title="Донаты" />
      {hasDAAuth ? (
        <IntegrationSwitch
          state={da}
          onChange={(checked) => dispatch(sendDaSubscribedState(checked))}
          icon={<DASvg className="base-icon da" />}
          title="Donation Alerts"
        />
      ) : (
        <DALoginButton />
      )}
      {hasDonatPayAuth ? (
        <IntegrationSwitch
          state={donatePay}
          onChange={(checked) => dispatch(sendDonatePaySubscribedState(checked))}
          icon={<DonatePaySvg className="base-icon donate-pay" />}
          title="DonatePay"
        />
      ) : (
        <DonatePayLoginButton />
      )}
      {(hasDAAuth || hasDonatPayAuth) && (
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
      )}
    </>
  );
};

export default DaIntegration;
