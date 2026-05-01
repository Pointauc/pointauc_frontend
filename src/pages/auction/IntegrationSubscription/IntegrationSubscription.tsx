import { FC, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Accordion, Group, Stack, Title } from '@mantine/core';

import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import { RootState } from '@reducers';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
import { isProduction } from '@utils/common.utils';

import IntegrationSubscriptionLogins from './Logins.tsx';
import IntegrationSubscriptionSwitches from './Switches.tsx';

const MockBidButton = lazy(() => import('@pages/auction/MockBidForm/MockBidButton'));

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);
  const labelClassNames = useMemo(
    () => ({
      labelWrapper: 'grow',
      body: 'w-full',
    }),
    [],
  );

  const availableSubscriptions = useMergedSubscriptionsState(available);
  const donateSubscriptions = useMergedSubscriptionsState(donate);
  const pointsSubscriptions = useMergedSubscriptionsState(points);

  const checkIsAnyLoading = (integrations: typeof available, subscriptions: typeof availableSubscriptions): boolean => {
    return integrations.some((integration) => subscriptions[integration.id]?.loading);
  };

  const checkAreAllSubscribed = (
    integrations: typeof available,
    subscriptions: typeof availableSubscriptions,
  ): boolean => {
    return integrations.length > 0 && integrations.every((integration) => subscriptions[integration.id]?.subscribed);
  };

  const toggleIntegrations = (
    integrations: typeof available,
    subscriptions: typeof availableSubscriptions,
  ): boolean => {
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
    <Accordion variant='separated' defaultValue='integrations' className='mb-2.5 w-full'>
      <Accordion.Item value='integrations'>
        <Accordion.Control>
          <Group align='center' wrap='nowrap'>
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
            <IntegrationSubscriptionSwitches
              donationIntegrations={donate}
              channelPointIntegrations={points}
              labelClassNames={labelClassNames}
              donationHotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleDonations}
              channelPointsHotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleChannelPoints}
            />
            <IntegrationSubscriptionLogins integrations={unavailable} />
            {!isProduction() && <MockBidButton />}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default IntegrationSubscription;
