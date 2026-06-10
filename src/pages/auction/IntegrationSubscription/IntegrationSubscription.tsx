import { lazy, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Collapse, Stack, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { useIntegrationsController } from '@domains/bids/external-integrations/shared/useIntegrationsController';
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

  const donateController = useIntegrationsController(donate);
  const pointsController = useIntegrationsController(points);
  const integrationDetailsToggleLabel = t(
    isContentExpanded
      ? 'integration.groupActions.hideIntegrationDetails'
      : 'integration.groupActions.showIntegrationDetails',
  );

  useAppHotkey(
    HOTKEY_ACTION_IDS.integrationsToggleDonations,
    (event, { setNotificationData }) => {
      event.preventDefault();
      const isEnabled = donateController.toggle();

      setNotificationData({ enabled: isEnabled });
    },
    {
      enabled: donate.length > 0 && !donateController.isAnyLoading,
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.integrationsToggleChannelPoints,
    (event, { setNotificationData }) => {
      event.preventDefault();
      const isEnabled = pointsController.toggle();

      setNotificationData({ enabled: isEnabled });
    },
    {
      enabled: points.length > 0 && !pointsController.isAnyLoading,
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
            subscriptions={donateController.subscriptions}
            title={t('integration.groups.donations')}
            icon={t('common.currencySign')}
            tooltip={t('integration.groupActions.startListeningDonations')}
            hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleDonations}
            onToggle={donateController.toggle}
          />
        )}
        {points.length > 0 && (
          <IntegrationGroupCard
            integrations={points}
            subscriptions={pointsController.subscriptions}
            title={t('integration.groups.channelPoints')}
            icon={<PointsIcon width={18} height={18} />}
            tooltip={t('integration.groupActions.startListeningPoints')}
            hotkeyActionId={HOTKEY_ACTION_IDS.integrationsToggleChannelPoints}
            onToggle={pointsController.toggle}
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
