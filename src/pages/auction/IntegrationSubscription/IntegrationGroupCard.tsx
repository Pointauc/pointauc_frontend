import { Group, Stack, Text, Tooltip } from '@mantine/core';
import clsx from 'clsx';

import { IconSize } from '@models/integration';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';
import {
  IntegrationStatusCardHeader,
  IntegrationStatusCardRoot,
} from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';

import type * as Integration from '@models/integration';
import type { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';
import type { IntegrationStatusCardStatus } from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';
import type { ReactNode } from 'react';

interface IntegrationGroupCardProps {
  integrations: Integration.Config[];
  subscriptions: ReturnType<typeof useMergedSubscriptionsState>;
  title: string;
  icon: ReactNode;
  tooltip: string;
  hotkeyActionId: HotkeyActionId;
  onToggle: () => void;
}

const getIntegrationStatus = (
  integration: Integration.Config,
  subscriptions: ReturnType<typeof useMergedSubscriptionsState>,
): IntegrationStatusCardStatus => {
  const subscription = subscriptions[integration.id];

  if (subscription?.loading) {
    return 'loading';
  }

  return subscription?.subscribed ? 'enabled' : 'disabled';
};

const IntegrationGroupCard = ({
  integrations,
  subscriptions,
  icon,
  tooltip,
  hotkeyActionId,
  onToggle,
}: IntegrationGroupCardProps) => {
  const isAnyLoading = integrations.some((integration) => subscriptions[integration.id]?.loading);
  const isEnabled =
    integrations.length > 0 && integrations.some((integration) => subscriptions[integration.id]?.subscribed);
  const status: IntegrationStatusCardStatus = isAnyLoading ? 'loading' : isEnabled ? 'enabled' : 'disabled';
  const tooltipLabel = (
    <Group gap={4}>
      <Text size='sm' fw={600}>
        {tooltip}
      </Text>
      <HotkeyHint actionId={hotkeyActionId} variant='tooltip' />
    </Group>
  );

  return (
    <Tooltip label={tooltipLabel} withArrow>
      <div>
        <IntegrationStatusCardRoot
          status={status}
          isInteractive={!isAnyLoading}
          isPressed={isEnabled}
          ariaLabel={tooltip}
          onClick={isAnyLoading ? undefined : onToggle}
          className='h-12'
        >
          <IntegrationStatusCardHeader
            status={status}
            indicatorPosition='start'
            className='h-full py-0 pr-2.5 pl-2'
            icon={
              <span className='flex h-7 w-7 items-center justify-center rounded-md text-base leading-none font-bold'>
                {icon}
              </span>
            }
            title={
              <div className='flex max-w-[92px] flex-none flex-nowrap items-center justify-end -space-x-0.5 overflow-hidden pl-1'>
                {integrations.map((integration) => {
                  const Icon = integration.branding.icon;
                  const integrationStatus = getIntegrationStatus(integration, subscriptions);

                  return (
                    <span
                      key={integration.id}
                      className={clsx(
                        'inline-flex items-center justify-center rounded-md',
                        status === 'enabled' && integrationStatus === 'disabled' && 'grayscale opacity-45',
                      )}
                      data-status={integrationStatus}
                    >
                      <Icon size={IconSize.EXTRA_SMALL} />
                    </span>
                  );
                })}
              </div>
            }
          />
        </IntegrationStatusCardRoot>
      </div>
    </Tooltip>
  );
};

export default IntegrationGroupCard;
