import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { Control } from 'react-hook-form';

import { sendDaSubscribedState, sendDonatePaySubscribedState } from '@reducers/Subscription/Subscription.ts';
import DASvg from '@assets/icons/DAAlert.svg?react';
import DonatePaySvg from '@assets/icons/donatePay.svg?react';
import IntegrationSwitch from '@components/IntegrationSwitch/IntegrationSwitch';
import FormInput from '@components/Form/FormInput/FormInput';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';
import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';

import DALoginButton from '../DALoginButton/DALoginButton';
import DonatePayLoginButton from '../DonatePayLoginButton/DonatePayLoginButton';
import { RootState } from '../../../reducers';
import './DAIntegration.scss';

interface DaIntegration {
  control: Control;
}

const DaIntegration: FC<DaIntegration> = ({ control }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { hasDAAuth, hasDonatPayAuth } = useSelector((root: RootState) => root.user);
  const { da, donatePay } = useSelector((root: RootState) => root.subscription);

  return (
    <>
      <SettingsGroupTitle title={t('settings.donations.title')} />
      {hasDAAuth ? (
        <IntegrationSwitch
          state={da}
          onChange={(checked) => dispatch(sendDaSubscribedState(checked))}
          icon={<DASvg className='base-icon da' />}
          title='Donation Alerts'
        />
      ) : (
        <DALoginButton />
      )}
      {hasDonatPayAuth ? (
        <IntegrationSwitch
          state={donatePay}
          onChange={(checked) => dispatch(sendDonatePaySubscribedState(checked))}
          icon={<DonatePaySvg className='base-icon donate-pay' />}
          title='DonatePay'
        />
      ) : (
        <DonatePayLoginButton />
      )}
      {(hasDAAuth || hasDonatPayAuth) && (
        <FormGroup>
          <FormGroup row className='auc-settings-row'>
            <FormInput
              name='pointsRate'
              control={control}
              label={t('settings.donations.pointsRate')}
              type='number'
              className='field md'
            />
          </FormGroup>
          <FormGroup row className='auc-settings-row'>
            <FormSwitch name='isIncrementActive' control={control} label={t('settings.donations.addTimeOnDonation')} />
            <FormInput name='incrementTime' className='field sm' control={control} type='number' />
            <Typography variant='body1'>{t('common.sec')}</Typography>
          </FormGroup>
        </FormGroup>
      )}
    </>
  );
};

export default DaIntegration;
