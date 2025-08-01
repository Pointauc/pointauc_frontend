import React from 'react';
import { Grid } from '@mui/material';

import CommonIntegrationsSettings from '@pages/settings/IntegrationsSettings/Common/CommonIntegrationsSettings.tsx';
import PointsSettings from '@pages/settings/IntegrationsSettings/Points/PointsSettings.tsx';
import DonationsSettings from '@pages/settings/IntegrationsSettings/Donations/DonationsSettings.tsx';
import EventsSettings from '@pages/settings/IntegrationsSettings/Events/EventsSettings.tsx';

const IntegrationsSettings = () => {
  return (
    <Grid container wrap='wrap' className='auction-settings' spacing={4}>
      <Grid size={12}>
        <CommonIntegrationsSettings />
      </Grid>
      <Grid size={6}>
        <PointsSettings />
      </Grid>
      <Grid size={6}>
        <DonationsSettings />
        {/*<EventsSettings />*/}
      </Grid>
    </Grid>
  );
};

export default IntegrationsSettings;
