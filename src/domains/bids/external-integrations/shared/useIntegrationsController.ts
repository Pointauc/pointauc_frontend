import { useCallback } from 'react';

import { connectIntegrationWithTimeout } from '@domains/bids/external-integrations/shared/pubsub/subscriptionTimeout';
import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';

import type * as Integration from '@models/integration';

export const useIntegrationsController = (integrations: Integration.Config[]) => {
  const subscriptions = useMergedSubscriptionsState(integrations);

  const isAnyLoading = integrations.some((integration) => subscriptions[integration.id]?.loading);
  const isAnySubscribed =
    integrations.length > 0 && integrations.some((integration) => subscriptions[integration.id]?.subscribed);

  const toggle = useCallback(() => {
    const shouldEnable = !isAnySubscribed;

    integrations.forEach((integration) => {
      if (shouldEnable) {
        connectIntegrationWithTimeout(integration).catch((err) => console.error(err));
      } else {
        integration.pubsubFlow.disconnect();
      }
    });

    return shouldEnable;
  }, [integrations, isAnySubscribed]);

  return {
    subscriptions,
    toggle,
    isAnyLoading,
    isAnySubscribed,
  };
};
