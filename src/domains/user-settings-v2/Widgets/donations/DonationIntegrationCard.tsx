import { Text } from '@mantine/core';
import { useStore } from '@tanstack/react-store';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getActiveRegion } from '@domains/bids/external-integrations/DonatePay/index.tsx';
import { connectIntegrationWithTimeout } from '@domains/bids/external-integrations/shared/pubsub/subscriptionTimeout';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';
import {
  IntegrationStatusCardBody,
  IntegrationStatusCardHeader,
  IntegrationStatusCardRoot,
} from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';

import type { Config } from '@models/integration';
import type { IntegrationStatusCardStatus } from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';

interface DonationIntegrationCardProps {
  integration: Config;
}

const DonationIntegrationCard = ({ integration }: DonationIntegrationCardProps) => {
  const { t } = useTranslation();
  const { id, branding } = integration;
  const { subscribed, loading } = useStore(integration.pubsubFlow.store, (state) => state);

  const status: IntegrationStatusCardStatus = loading ? 'loading' : subscribed ? 'enabled' : 'disabled';
  const Icon = branding.icon;

  const displayName = useMemo(() => {
    const baseName = t(`integration.${id}.name`);

    if (id === 'donatePay') {
      const region = getActiveRegion();

      if (region) {
        return `${baseName} (${region.toUpperCase()})`;
      }
    }

    return baseName;
  }, [id, t]);

  const handleToggle = useCallback(() => {
    if (loading) {
      return;
    }

    if (subscribed) {
      void integration.pubsubFlow.disconnect();
      return;
    }

    void connectIntegrationWithTimeout(integration).catch((err) => console.error(err));
  }, [integration, loading, subscribed]);

  return (
    <IntegrationStatusCardRoot
      status={status}
      isInteractive
      isPressed={subscribed}
      ariaLabel={displayName}
      onClick={handleToggle}
    >
      <IntegrationStatusCardHeader
        status={status}
        title={
          <div className='flex min-w-0 flex-nowrap items-center gap-1.5'>
            <Icon size={22} />
            <Text fw={600} size='sm' truncate>
              {displayName}
            </Text>
          </div>
        }
      />

      <IntegrationStatusCardBody onClick={(event) => event.stopPropagation()}>
        <RevokeIntegrationButton
          revoke={integration.authFlow.revoke}
          className='border-paper-200 hover:border-paper-100 hover:bg-paper-600 w-full border'
        />
      </IntegrationStatusCardBody>
    </IntegrationStatusCardRoot>
  );
};

export default DonationIntegrationCard;
