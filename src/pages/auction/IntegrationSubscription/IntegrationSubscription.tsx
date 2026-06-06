import { lazy, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Collapse, Stack, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { connectIntegrationWithTimeout } from '@domains/bids/external-integrations/shared/pubsub/subscriptionTimeout';
import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
import { isProduction } from '@utils/common.utils';
import PointsIcon from '@assets/icons/channelPoints.svg?react';

import IntegrationGroupCard from './IntegrationGroupCard.tsx';
import IntegrationSubscriptionLogins from './Logins.tsx';

import type { RootState } from '@reducers';
import type { FC } from 'react';

const MockBidButton = lazy(() => import('@pages/auction/MockBidForm/MockBidButton'));

const IntegrationSubscription: FC = () => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);
  const [isContentExpanded, setIsContentExpanded] = useState(true);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);

  const donateSubscriptions = useMergedSubscriptionsState(donate);
  const pointsSubscriptions = useMergedSubscriptionsState(points);
  const integrationDetailsToggleLabel = t(
    isContentExpanded
      ? 'integration.groupActions.hideIntegrationDetails'
      : 'integration.groupActions.showIntegrationDetails',
  );

  const checkIsAnyLoading = (
    integrations: typeof available,
    subscriptions: ReturnType<typeof useMergedSubscriptionsState>,
  ): boolean => {
    return integrations.some((integration) => subscriptions[integration.id]?.loading);
  };

  const checkIsAnySubscribed = (
    integrations: typeof available,
    subscriptions: ReturnType<typeof useMergedSubscriptionsState>,
  ): boolean => {
    return integrations.length > 0 && integrations.some((integration) => subscriptions[integration.id]?.subscribed);
  };

  const toggleIntegrations = (
    integrations: typeof available,
    subscriptions: ReturnType<typeof useMergedSubscriptionsState>,
  ): boolean => {
    const shouldEnable = !checkIsAnySubscribed(integrations, subscriptions);

    integrations.forEach((integration) => {
      if (shouldEnable) {
        connectIntegrationWithTimeout(integration).catch((err) => console.error(err));
      } else {
        integration.pubsubFlow.disconnect();
      }
    });

    return shouldEnable;
  };

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
    <section className='mb-2 w-full'>
      <Tooltip label={integrationDetailsToggleLabel} withArrow>
        <UnstyledButton
          className='text-paper-50 inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
          aria-label={integrationDetailsToggleLabel}
          aria-expanded={isContentExpanded}
          onClick={() => setIsContentExpanded((current) => !current)}
        >
          <Title order={4}>{t('auc.integrations')}</Title>
          <IconChevronDown
            size={18}
            className={
              isContentExpanded ? 'transition-transform duration-150' : '-rotate-90 transition-transform duration-150'
            }
          />
        </UnstyledButton>
      </Tooltip>

      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
        {donate.length > 0 && (
          <IntegrationGroupCard
            integrations={donate}
            subscriptions={donateSubscriptions}
            title={t('integration.groups.donations')}
            icon={t('common.currencySign')}
            tooltip={t('integration.groupActions.startListeningDonations')}
            hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleDonations}
            onToggle={() => toggleIntegrations(donate, donateSubscriptions)}
          />
        )}
        {points.length > 0 && (
          <IntegrationGroupCard
            integrations={points}
            subscriptions={pointsSubscriptions}
            title={t('integration.groups.channelPoints')}
            icon={<PointsIcon width={18} height={18} />}
            tooltip={t('integration.groupActions.startListeningPoints')}
            hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleChannelPoints}
            onToggle={() => toggleIntegrations(points, pointsSubscriptions)}
          />
        )}
      </div>

      <Collapse expanded={isContentExpanded} keepMounted transitionDuration={180}>
        <Stack gap='sm' className='pt-2'>
          <IntegrationSubscriptionLogins integrations={unavailable} />
          {!isProduction() && <MockBidButton />}
        </Stack>
      </Collapse>
    </section>
  );
};

export default IntegrationSubscription;
