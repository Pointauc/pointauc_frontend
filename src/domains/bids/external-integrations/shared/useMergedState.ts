import { useEffect, useState } from 'react';

import * as Integration from '@models/integration';

type Subscriptions = {
  [key in Integration.ID]?: Integration.PubsubSubscription;
};

const buildInitialSubscriptions = (integrations: Integration.Config[]): Subscriptions => {
  return integrations.reduce((acc, integration) => {
    acc[integration.id] = integration.pubsubFlow.store.state;
    return acc;
  }, {} as Subscriptions);
};

export const useMergedSubscriptionsState = (integrations: Integration.Config[]): Subscriptions => {
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({});

  useEffect(() => {
    setSubscriptions(buildInitialSubscriptions(integrations));

    const unsubscribeFunctions = integrations.map((integration) => {
      return integration.pubsubFlow.store.subscribe((state) => {
        setSubscriptions((prev) => {
          return { ...prev, [integration.id]: state.currentVal };
        });
      });
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [integrations]);

  return subscriptions;
};
