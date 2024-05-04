import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import './IntegrationSubscription.scss';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import PubsubSwitchGroup from '@components/Integration/PubsubFlow/components/PubsubSwitchGroup.tsx';

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);

  return (
    <Accordion defaultExpanded className='fast-access'>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
        <Grid container alignItems='center'>
          <Typography style={{ flexGrow: 1 }}>{t('auc.integrations')}</Typography>
          <SwitchAllIntegrations integrations={available} />
        </Grid>
      </AccordionSummary>
      <AccordionDetails className='content'>
        {donate.length <= 1 &&
          donate.map((integration) => <PubsubSwitch key={integration.id} integration={integration} />)}
        {donate.length > 1 && <PubsubSwitchGroup integrations={donate} />}
        {points.map((integration) => (
          <PubsubSwitch key={integration.id} integration={integration} />
        ))}
        {unavailable.map((integration) => (
          <integration.authFlow.loginComponent key={integration.id} integration={integration} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default IntegrationSubscription;
