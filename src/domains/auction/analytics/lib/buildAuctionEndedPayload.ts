import { analyticsEventNames } from '@shared/lib/analytics/events';
import { COLORS } from '@constants/color.constants';

import type { AuctionFeatureUsageState } from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import type { AnalyticsEventMap } from '@shared/lib/analytics/events';
import type { AucSettingsState } from '@reducers/AucSettings/AucSettings';
import type { Slot } from '@models/slot.model';

interface BuildAuctionEndedPayloadParams {
  settings: AucSettingsState['settings'];
  lots: Slot[];
  featureUsage: AuctionFeatureUsageState;
}

const getLotAmount = (lot: Slot): number => Number(lot.amount ?? 0) + Number(lot.extra ?? 0);

const getUniqueParticipantCount = (lots: Slot[]): number => {
  const participantIds = new Set<string>();

  lots.forEach((lot) => {
    lot.investors?.forEach((investorId) => participantIds.add(investorId));
  });

  return participantIds.size;
};

const getTrackedEntityCount = (trackedEntities: Record<string, true>): number => {
  return Object.keys(trackedEntities).length;
};

const getTrackedIntegrationIds = (trackedIntegrations: Partial<Record<string, true>>): string[] => {
  return Object.keys(trackedIntegrations).sort();
};

export const buildAuctionEndedPayload = ({
  settings,
  lots,
  featureUsage,
}: BuildAuctionEndedPayloadParams): AnalyticsEventMap[typeof analyticsEventNames.auctionEnded] => {
  const activeLots = lots.filter((lot) => Boolean(lot.name) || getLotAmount(lot) > 0);
  const amounts = activeLots.map(getLotAmount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  const lotCount = activeLots.length;
  const lotNamesWithUrlCount = getTrackedEntityCount(featureUsage.lotNamesWithUrl);
  const autoParsedLotNamesWithUrlCount = getTrackedEntityCount(featureUsage.autoParsedLotNamesWithUrl);
  const enabledIntegrations = getTrackedIntegrationIds(featureUsage.enabledIntegrations);
  const integrationsWithTransferredBids = getTrackedIntegrationIds(featureUsage.integrationsWithTransferredBids);

  return {
    timer_start_minutes: Number(settings.startTime),
    is_donation_autoincrement_active: settings.isAutoincrementActive,
    is_new_slot_increment_active: settings.isNewSlotIncrement,
    is_leader_change_increment_active: settings.isIncrementActive,
    is_min_time_active: settings.isMinTimeActive,
    is_max_time_active: settings.isMaxTimeActive,
    is_show_chances: settings.showChances,
    is_show_total_time: settings.showTotalTime,
    is_hide_amounts: settings.hideAmounts,
    insert_strategy: String(settings.insertStrategy),
    bid_name_strategy: String(settings.bidNameStrategy),
    background_type: String(settings.backgroundType),
    background_overlay_opacity: settings.backgroundOverlayOpacity,
    background_blur: settings.backgroundBlur,
    is_geometry_background_color_enabled: settings.isGeometryBackgroundColorEnabled,
    is_custom_primary_color: settings.primaryColor !== COLORS.THEME.PRIMARY,
    purchase_sort: String(settings.purchaseSort),
    is_marbles_auc_enabled: settings.marblesAuc,
    is_max_time_enabled: settings.isMaxTimeActive,
    is_lucky_wheel_enabled: settings.luckyWheelEnabled,
    lot_count: lotCount,
    total_amount: totalAmount,
    max_amount: amounts.length > 0 ? Math.max(...amounts) : 0,
    average_amount: lotCount > 0 ? Number((totalAmount / lotCount).toFixed(2)) : 0,
    has_favorites: activeLots.some((lot) => lot.isFavorite),
    has_locked_percentage: activeLots.some((lot) => lot.lockedPercentage !== null),
    lot_names_with_url_count: lotNamesWithUrlCount,
    auto_parsed_lot_names_with_url_count: autoParsedLotNamesWithUrlCount,
    auto_parsed_lot_names_with_url_percent:
      lotNamesWithUrlCount > 0 ? Number(((autoParsedLotNamesWithUrlCount / lotNamesWithUrlCount) * 100).toFixed(2)) : 0,
    enabled_integrations: enabledIntegrations.join(','),
    enabled_integrations_count: enabledIntegrations.length,
    integrations_with_transferred_bids: integrationsWithTransferredBids.join(','),
    integrations_with_transferred_bids_count: integrationsWithTransferredBids.length,
  };
};
