import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  trackAuctionEnabledIntegration,
  trackAuctionIntegrationTransferredBid,
} from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import { publishGlobalBid, registerGlobalBidFallbackConsumer } from '@domains/bids/lib/globalBidsEventBus.ts';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';

import type { ThunkDispatch } from 'redux-thunk';

const GlobalBidRuntime = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  useEffect(() => {
    const integrationSubscriptionUnsubscribers = integrations.all.map((integration) => {
      const syncIntegrationUsage = () => {
        if (integration.pubsubFlow.store.state.subscribed) {
          trackAuctionEnabledIntegration(integration.id);
        }
      };

      syncIntegrationUsage();
      return integration.pubsubFlow.store.subscribe(() => {
        syncIntegrationUsage();
      });
    });

    const integrationBidUnsubscribers = integrations.all.map((integration) => {
      const handleBid = (bid: Purchase) => {
        trackAuctionIntegrationTransferredBid(integration.id);
        void publishGlobalBid(bid);
      };

      integration.pubsubFlow.events.on('bid', handleBid);

      return () => {
        integration.pubsubFlow.events.off('bid', handleBid);
      };
    });

    return () => {
      integrationSubscriptionUnsubscribers.forEach((unsubscribe) => unsubscribe());
      integrationBidUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return null;
};

export default GlobalBidRuntime;
