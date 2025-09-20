import { Grid } from '@mantine/core';

import CommonIntegrationsSettings from '@pages/settings/IntegrationsSettings/Common/CommonIntegrationsSettings.tsx';
import DonationsSettings from '@pages/settings/IntegrationsSettings/Donations/DonationsSettings.tsx';
import PointsSettings from '@pages/settings/IntegrationsSettings/Points/PointsSettings.tsx';

const IntegrationsSettings = () => {
  return (
    <Grid gutter='xl' overflow='clip'>
      <Grid.Col span={12}>
        <CommonIntegrationsSettings />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <PointsSettings />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <DonationsSettings />
      </Grid.Col>
    </Grid>
  );
};

export default IntegrationsSettings;
