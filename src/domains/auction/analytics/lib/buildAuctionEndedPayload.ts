import { analyticsEventNames } from '@shared/lib/analytics/events';

import type { AnalyticsEventMap } from '@shared/lib/analytics/events';
import type { AucSettingsState } from '@reducers/AucSettings/AucSettings';
import type { Slot } from '@models/slot.model';

interface BuildAuctionEndedPayloadParams {
  settings: AucSettingsState['settings'];
  lots: Slot[];
}

const getLotAmount = (lot: Slot): number => Number(lot.amount ?? 0) + Number(lot.extra ?? 0);

const getUniqueParticipantCount = (lots: Slot[]): number => {
  const participantIds = new Set<string>();

  lots.forEach((lot) => {
    lot.investors?.forEach((investorId) => participantIds.add(investorId));
  });

  return participantIds.size;
};

export const buildAuctionEndedPayload = ({
  settings,
  lots,
}: BuildAuctionEndedPayloadParams): AnalyticsEventMap[typeof analyticsEventNames.auctionEnded] => {
  const activeLots = lots.filter((lot) => Boolean(lot.name) || getLotAmount(lot) > 0);
  const amounts = activeLots.map(getLotAmount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  const lotCount = activeLots.length;

  return {
    timerStartMinutes: Number(settings.startTime),
    timerStepSeconds: Number(settings.timeStep),
    isAutoincrementActive: settings.isAutoincrementActive,
    isNewSlotIncrement: settings.isNewSlotIncrement,
    isBidIncrementActive: settings.isIncrementActive,
    isMinTimeActive: settings.isMinTimeActive,
    isMaxTimeActive: settings.isMaxTimeActive,
    showChances: settings.showChances,
    showTotalTime: settings.showTotalTime,
    isBuyoutVisible: settings.isBuyoutVisible,
    hideAmounts: settings.hideAmounts,
    dynamicRewards: settings.dynamicRewards,
    insertStrategy: String(settings.insertStrategy),
    bidNameStrategy: String(settings.bidNameStrategy),
    lotCount,
    participantCount: getUniqueParticipantCount(activeLots),
    totalAmount,
    maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
    averageAmount: lotCount > 0 ? Number((totalAmount / lotCount).toFixed(2)) : 0,
    favoriteLotCount: activeLots.filter((lot) => lot.isFavorite).length,
  };
};
