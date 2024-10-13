import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import TokenSettings from '@components/SettingsPage/TokenSettings/TokenSettings.tsx';
import IntegrationCommon from '@components/IntegrationPage/IntegrationCommon';

const CommonIntegrationsSettings = () => {
  const { t } = useTranslation();

  return (
    <SettingsGroup className='common-integrations-settings' title={t('settings.integrationCommon.integrationCommon')}>
      <Grid container spacing={4}>
        <Grid item container direction='column' xs={6}>
          <IntegrationCommon />
        </Grid>
        <Grid item xs={6}>
          <TokenSettings />
        </Grid>
      </Grid>
    </SettingsGroup>
  );
};

export default CommonIntegrationsSettings;
