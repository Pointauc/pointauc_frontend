import { Store } from '@tanstack/react-store';

import {
  buildEnabledIntegrationsState,
  buildLotNameTrackingKey,
  createInitialAuctionFeatureUsageState,
} from './auctionFeatureUsageStore.state';

import type { ID as IntegrationId } from '@models/integration';
import type {
  AuctionFeatureUsageState,
  ResetAuctionFeatureUsageStateParams,
  TrackLotNameWithUrlParams,
} from './auctionFeatureUsageStore.types';

export type {
  AuctionFeatureUsageState,
  ResetAuctionFeatureUsageStateParams,
  TrackLotNameWithUrlParams,
} from './auctionFeatureUsageStore.types';

export const auctionFeatureUsageStore = new Store<AuctionFeatureUsageState>(createInitialAuctionFeatureUsageState());

export const trackAuctionLotNameWithUrl = (params: TrackLotNameWithUrlParams): void => {
  const trackingKey = buildLotNameTrackingKey(params);

  auctionFeatureUsageStore.setState((state) => {
    // This store is updated from hot auction flows, so we bail out early to avoid
    // extra allocations when analytics has already seen the same input.
    if (state.lotNamesWithUrl[trackingKey]) {
      return state;
    }

    return {
      ...state,
      lotNamesWithUrl: {
        ...state.lotNamesWithUrl,
        [trackingKey]: true,
      },
    };
  });
};

export const trackAuctionAutoParsedLotNameWithUrl = (params: TrackLotNameWithUrlParams): void => {
  const trackingKey = buildLotNameTrackingKey(params);

  auctionFeatureUsageStore.setState((state) => {
    // Keep analytics overhead tiny: repeated parser effects should become a no-op.
    if (state.autoParsedLotNamesWithUrl[trackingKey] && state.lotNamesWithUrl[trackingKey]) {
      return state;
    }

    return {
      ...state,
      lotNamesWithUrl: {
        ...state.lotNamesWithUrl,
        [trackingKey]: true,
      },
      autoParsedLotNamesWithUrl: {
        ...state.autoParsedLotNamesWithUrl,
        [trackingKey]: true,
      },
    };
  });
};

export const trackAuctionEnabledIntegration = (integrationId: IntegrationId): void => {
  auctionFeatureUsageStore.setState((state) => {
    // Integrations can reconnect or emit repeated subscription updates; analytics
    // should record the first observation and skip the rest.
    if (state.enabledIntegrations[integrationId]) {
      return state;
    }

    return {
      ...state,
      enabledIntegrations: {
        ...state.enabledIntegrations,
        [integrationId]: true,
      },
    };
  });
};

export const trackAuctionIntegrationTransferredBid = (integrationId: IntegrationId): void => {
  auctionFeatureUsageStore.setState((state) => {
    // Bid delivery is latency-sensitive, so analytics must avoid work after the
    // first tracked bid for a given integration within the auction window.
    if (state.integrationsWithTransferredBids[integrationId]) {
      return state;
    }

    return {
      ...state,
      integrationsWithTransferredBids: {
        ...state.integrationsWithTransferredBids,
        [integrationId]: true,
      },
    };
  });
};

export const getAuctionFeatureUsageState = (): AuctionFeatureUsageState => {
  return auctionFeatureUsageStore.state;
};

export const resetAuctionFeatureUsageState = (params: ResetAuctionFeatureUsageStateParams = {}): void => {
  // Reset with a single replacement object so ending an auction stays cheap and
  // analytics remains a lightweight side effect.
  auctionFeatureUsageStore.setState({
    ...createInitialAuctionFeatureUsageState(),
    enabledIntegrations: buildEnabledIntegrationsState(params.enabledIntegrationIds),
  });
};
