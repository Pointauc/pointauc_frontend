import type { ID as IntegrationId } from '@models/integration';

export interface AuctionFeatureUsageState {
  lotNamesWithUrl: Record<string, true>;
  autoParsedLotNamesWithUrl: Record<string, true>;
  enabledIntegrations: Partial<Record<IntegrationId, true>>;
  integrationsWithTransferredBids: Partial<Record<IntegrationId, true>>;
}

export interface ResetAuctionFeatureUsageStateParams {
  enabledIntegrationIds?: IntegrationId[];
}

export interface TrackLotNameWithUrlParams {
  lotId: string;
}
