import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import TokenSettings from '@pages/settings/IntegrationsSettings/TokenSettings/TokenSettings';
import IntegrationCommon from '@pages/settings/IntegrationsSettings/Common/IntegrationCommon';

const CommonIntegrationsSettings = () => {
  const { t } = useTranslation();

  return (
    <SettingsGroup className='common-integrations-settings' title={t('settings.integrationCommon.integrationCommon')}>
      <Grid container spacing={4}>
        <Grid container direction='column' size={6}>
          <IntegrationCommon />
        </Grid>
        <Grid size={6}>
          <TokenSettings />
        </Grid>
      </Grid>
    </SettingsGroup>
  );
};

export default CommonIntegrationsSettings;
