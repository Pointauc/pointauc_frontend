import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import './IntegrationSubscription.scss';

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { available, unavailable } = useMemo(() => integrationUtils.groupBy.availability(INTEGRATIONS, user), [user]);

  return (
    <Accordion defaultExpanded className='fast-access'>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
        <Typography>{t('auc.integrations')}</Typography>
      </AccordionSummary>
      <AccordionDetails className='content'>
        {available.map((integration) => (
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
