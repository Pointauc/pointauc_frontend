import { FC, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Accordion, Divider, Group, Stack, Title } from '@mantine/core';

import PubsubSwitch from '@domains/bids/external-integrations/shared/pubsub/ui/PubsubSwitch.tsx';
import PubsubSwitchGroup from '@domains/bids/external-integrations/shared/pubsub/ui/PubsubSwitchGroup.tsx';
import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import { RootState } from '@reducers';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
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
  const availableSubscriptions = useMergedSubscriptionsState(available);
  const donateSubscriptions = useMergedSubscriptionsState(donate);
  const pointsSubscriptions = useMergedSubscriptionsState(points);

  const checkIsAnyLoading = (integrations: typeof available, subscriptions: typeof availableSubscriptions): boolean => {
    return integrations.some((integration) => subscriptions[integration.id]?.loading);
  };

  const checkAreAllSubscribed = (integrations: typeof available, subscriptions: typeof availableSubscriptions): boolean => {
    return integrations.length > 0 && integrations.every((integration) => subscriptions[integration.id]?.subscribed);
  };

  const toggleIntegrations = (integrations: typeof available, subscriptions: typeof availableSubscriptions): boolean => {
    const shouldEnable = !checkAreAllSubscribed(integrations, subscriptions);

    integrations.forEach((integration) => {
      if (shouldEnable) {
        integration.pubsubFlow.connect();
      } else {
        integration.pubsubFlow.disconnect();
      }
    });

    return shouldEnable;
  };

  useAppHotkey(
    HOTKEY_ACTION_IDS.integrationsToggleAll,
    (event, { setNotificationData }) => {
      event.preventDefault();
      const isEnabled = toggleIntegrations(available, availableSubscriptions);

      setNotificationData({ enabled: isEnabled });
    },
    {
      enabled: available.length > 0 && !checkIsAnyLoading(available, availableSubscriptions),
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.integrationsToggleDonations,
    (event, { setNotificationData }) => {
      event.preventDefault();
      const isEnabled = toggleIntegrations(donate, donateSubscriptions);

      setNotificationData({ enabled: isEnabled });
    },
    {
      enabled: donate.length > 0 && !checkIsAnyLoading(donate, donateSubscriptions),
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.integrationsToggleChannelPoints,
    (event, { setNotificationData }) => {
      event.preventDefault();
      const isEnabled = toggleIntegrations(points, pointsSubscriptions);

      setNotificationData({ enabled: isEnabled });
    },
    {
      enabled: points.length > 0 && !checkIsAnyLoading(points, pointsSubscriptions),
      preventDefault: true,
    },
  );

  return (
    <Accordion variant='separated' defaultValue='integrations' classNames={{ root: classes.accordion }}>
      <Accordion.Item value='integrations'>
        <Accordion.Control>
          <Group align='center'>
            <Title order={4}>{t('auc.integrations')}</Title>
            {available.length > 0 && (
              <SwitchAllIntegrations
                integrations={available}
                showLabel={false}
                classNames={labelClassNames}
                hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleAll}
              />
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
                  hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleDonations}
                />
              ))}
            {donate.length > 1 && (
              <PubsubSwitchGroup
                integrations={donate}
                classNames={labelClassNames}
                labelText={t('integration.groups.donations')}
                hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleDonations}
              />
            )}
            {points.length <= 1 &&
              points.map((integration) => (
                <PubsubSwitch
                  key={integration.id}
                  switchProps={{ classNames: labelClassNames }}
                  integration={integration}
                  hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleChannelPoints}
                />
              ))}
            {points.length > 1 && (
              <PubsubSwitchGroup
                integrations={points}
                classNames={labelClassNames}
                labelText={t('integration.groups.channelPoints')}
                hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleChannelPoints}
              />
            )}
            {partnerIntegrations.map((integration) => (
              <integration.authFlow.loginComponent
                key={integration.id}
                id={integration.id}
                branding={integration.branding}
              />
            ))}
            {hasPartnerAndRegular && <Divider />}
            {regularIntegrations.map((integration) => (
              <integration.authFlow.loginComponent
                key={integration.id}
                id={integration.id}
                branding={integration.branding}
              />
            ))}
            {!isProduction() && <MockBidButton />}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default IntegrationSubscription;
