import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import {
  publishGlobalBid,
  registerGlobalBidFallbackConsumer,
} from '@domains/bids/lib/globalBidsEventBus.ts';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';

import type { ThunkDispatch } from 'redux-thunk';

const GlobalBidRuntime = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  useEffect(() => {
    const unsubscribers = integrations.all.map((integration) => {
      const handleBid = (bid: Purchase) => {
        void publishGlobalBid(bid);
      };

      integration.pubsubFlow.events.on('bid', handleBid);

      return () => {
        integration.pubsubFlow.events.off('bid', handleBid);
      };
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    return registerGlobalBidFallbackConsumer(async (bid) => {
      dispatch(processRedemption(bid));
      return true;
    });
  }, [dispatch]);

  return null;
};

export default GlobalBidRuntime;
