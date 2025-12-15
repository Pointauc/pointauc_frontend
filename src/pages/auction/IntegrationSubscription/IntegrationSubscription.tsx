import { FC, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Accordion, Divider, Group, Stack, Title } from '@mantine/core';

import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import PubsubSwitchGroup from '@components/Integration/PubsubFlow/components/PubsubSwitchGroup.tsx';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import { RootState } from '@reducers';
import { isProduction } from '@utils/common.utils';

import classes from './IntegrationSubscription.module.css';

const MockBidButton = lazy(() => import('@pages/auction/MockBidForm/MockBidButton'));

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);
  const { partner: partnerIntegrations, regular: regularIntegrations } = useMemo(
    () => integrationUtils.groupBy.partner(unavailable),
    [unavailable],
  );
  const labelClassNames = useMemo(
    () => ({
      labelWrapper: classes.switchLabelWrapper,
      body: classes.switchBody,
      track: classes.switchTrack,
      root: classes.switchRoot,
    }),
    [],
  );

  const hasPartnerAndRegular = partnerIntegrations.length > 0 && regularIntegrations.length > 0;

  return (
    <Accordion variant='separated' defaultValue='integrations' classNames={{ root: classes.accordion }}>
      <Accordion.Item value='integrations'>
        <Accordion.Control>
          <Group align='center'>
            <Title order={4}>{t('auc.integrations')}</Title>
            {available.length > 0 && (
              <SwitchAllIntegrations integrations={available} showLabel={false} classNames={labelClassNames} />
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap='sm'>
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
            {partnerIntegrations.map((integration) => (
              <integration.authFlow.loginComponent key={integration.id} integration={integration} />
            ))}
            {hasPartnerAndRegular && <Divider />}
            {regularIntegrations.map((integration) => (
              <integration.authFlow.loginComponent key={integration.id} integration={integration} />
            ))}
            {!isProduction() && <MockBidButton />}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default IntegrationSubscription;
