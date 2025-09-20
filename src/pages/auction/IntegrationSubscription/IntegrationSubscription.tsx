import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Popover, Typography } from '@mui/material';
import { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Group, Stack } from '@mantine/core';

import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import PubsubSwitchGroup from '@components/Integration/PubsubFlow/components/PubsubSwitchGroup.tsx';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import MockBidForm from '@pages/auction/MockBidForm/MockBidForm';
import { RootState } from '@reducers';
import { isProduction } from '@utils/common.utils';

import './IntegrationSubscription.scss';
import classes from './IntegrationSubscription.module.css';

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);
  const [mockBidOpen, setMockBidOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);
  const labelClassNames = useMemo(
    () => ({
      labelWrapper: classes.switchLabelWrapper,
      body: classes.switchBody,
      track: classes.switchTrack,
      root: classes.switchRoot,
    }),
    [],
  );

  return (
    <Accordion defaultExpanded className='fast-access'>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
        <Group align='center'>
          <Typography style={{ flexGrow: 1 }}>{t('auc.integrations')}</Typography>
          <SwitchAllIntegrations integrations={available} showLabel={false} classNames={labelClassNames} />
        </Group>
      </AccordionSummary>
      <AccordionDetails className='content'>
        <Stack>
          {donate.length <= 1 &&
            donate.map((integration) => (
              <PubsubSwitch
                key={integration.id}
                switchProps={{ classNames: labelClassNames }}
                integration={integration}
              />
            ))}
          {donate.length > 1 && <PubsubSwitchGroup integrations={donate} classNames={labelClassNames} />}
          {points.map((integration) => (
            <PubsubSwitch
              key={integration.id}
              switchProps={{ classNames: labelClassNames }}
              integration={integration}
            />
          ))}
          {unavailable.map((integration) => (
            <integration.authFlow.loginComponent key={integration.id} integration={integration} />
          ))}
          {!isProduction() && (
            <>
              <Button ref={anchorRef} onClick={() => setMockBidOpen(true)} variant='contained' color='primary'>
                Send Test Bid
              </Button>
              {mockBidOpen && (
                <Popover
                  open={mockBidOpen}
                  onClose={() => setMockBidOpen(false)}
                  anchorEl={anchorRef.current}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  <MockBidForm />
                </Popover>
              )}
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default IntegrationSubscription;
