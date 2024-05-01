import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { Control } from 'react-hook-form';

import FormInput from '@components/Form/FormInput/FormInput';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';
import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '@reducers';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { integrations } from '@components/Integration/integrations.ts';
import './DAIntegration.scss';

interface DaIntegration {
  control: Control;
}

const DaIntegration: FC<DaIntegration> = ({ control }) => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.donate, user),
    [user],
  );

  return (
    <>
      <SettingsGroupTitle title={t('settings.donations.title')} />
      {available.map((integration) => (
        <PubsubSwitch integration={integration} key={integration.id} />
      ))}
      {unavailable.map((integration) => (
        <integration.authFlow.loginComponent key={integration.id} integration={integration} />
      ))}
      {available.length > 0 && (
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
