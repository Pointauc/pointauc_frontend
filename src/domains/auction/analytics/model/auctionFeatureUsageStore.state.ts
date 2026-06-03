import type { ID as IntegrationId } from '@models/integration';
import type { AuctionFeatureUsageState, TrackLotNameWithUrlParams } from './auctionFeatureUsageStore.types';

export const createInitialAuctionFeatureUsageState = (): AuctionFeatureUsageState => ({
  lotNamesWithUrl: {},
  autoParsedLotNamesWithUrl: {},
  enabledIntegrations: {},
  integrationsWithTransferredBids: {},
});

export const buildLotNameTrackingKey = ({ lotId }: TrackLotNameWithUrlParams): string => {
  return lotId;
};

export const buildEnabledIntegrationsState = (
  enabledIntegrationIds: IntegrationId[] = [],
): Partial<Record<IntegrationId, true>> => {
  return enabledIntegrationIds.reduce<Partial<Record<IntegrationId, true>>>((acc, integrationId) => {
    acc[integrationId] = true;
    return acc;
  }, {});
};
