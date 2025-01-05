import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FormGroup, Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import { RootState } from '@reducers';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { integrations } from '@components/Integration/integrations.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import FormInput from '@components/Form/FormInput/FormInput.tsx';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';
import ExchangeRate from '@pages/settings/IntegrationsSettings/Donations/ExchangeRate';
import '@pages/settings/IntegrationsSettings/Donations/DonationsSettings.scss';

const DonationsSettings = () => {
  const { t } = useTranslation();
  const authData = useSelector((root: RootState) => root.user.authData);
  const { control } = useFormContext();

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.donate, authData),
    [authData],
  );

  return (
    <SettingsGroup className='donations-settings' title={t('settings.donations.donations')}>
      {available.map((integration) => (
        <PubsubSwitch integration={integration} key={integration.id} />
      ))}
      {unavailable.length > 0 && (
        <Grid container gap={2}>
          {unavailable.map((integration) => (
            <integration.authFlow.loginComponent key={integration.id} integration={integration} />
          ))}
        </Grid>
      )}
      {available.length > 0 && (
        <FormGroup sx={{ mt: 2 }}>
          <FormGroup row className='auc-settings-row'>
            <ExchangeRate />
          </FormGroup>
          <FormGroup row className='auc-settings-row'>
            <FormSwitch name='isIncrementActive' control={control} label={t('settings.donations.addTimeOnDonation')} />
            <FormInput name='incrementTime' className='field sm' control={control} type='number' />
            <Typography variant='body1'>{t('common.sec')}</Typography>
          </FormGroup>
        </FormGroup>
      )}
    </SettingsGroup>
  );
};

export default DonationsSettings;
