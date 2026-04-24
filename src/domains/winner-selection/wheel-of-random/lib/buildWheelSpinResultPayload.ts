import { WheelFormat } from '@constants/wheel.ts';
import { WheelItem } from '@models/wheel.model.ts';
import { analyticsEventNames, type AnalyticsEventMap } from '@shared/lib/analytics/events/catalog';

import { DropoutVariant } from '../BaseWheel/DropoutVariant';

interface BuildWheelSpinResultPayloadParams {
  settings: Wheel.Settings;
  allItems: WheelItem[];
  finalSpinItems: WheelItem[];
  winnerId: string | number;
  spinDuration: number;
}

interface WheelStatistics {
  averageWeight: number;
  maxWeight: number;
  minWeight: number;
  participantCount: number;
  totalWeight: number;
}

const roundStatistic = (value: number): number => Number(value.toFixed(3));

const checkHasPositiveAmount = (items: WheelItem[]): boolean => items.some(({ amount }) => amount > 0);

const normalizeItems = (items: WheelItem[]): WheelItem[] => {
  if (checkHasPositiveAmount(items)) {
    return items.filter(({ amount }) => amount > 0);
  }

  return items.map((item) => ({ ...item, amount: 1 }));
};

const calculateWheelStatistics = (items: WheelItem[]): WheelStatistics => {
  if (items.length === 0) {
    return {
      averageWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      participantCount: 0,
      totalWeight: 0,
    };
  }

  const weights = items.map(({ amount }) => amount);
  const totalWeight = weights.reduce((sum, amount) => sum + amount, 0);

  return {
    averageWeight: roundStatistic(totalWeight / items.length),
    maxWeight: Math.max(...weights),
    minWeight: Math.min(...weights),
    participantCount: items.length,
    totalWeight: roundStatistic(totalWeight),
  };
};

const calculateWinnerChancePercent = (winnerWeight: number, totalWeight: number): number => {
  if (totalWeight <= 0) {
    return 0;
  }

  return roundStatistic((winnerWeight / totalWeight) * 100);
};

const mapWheelFormat = (
  format: WheelFormat,
): AnalyticsEventMap[typeof analyticsEventNames.wheelSpinResult]['format'] => {
  switch (format) {
    case WheelFormat.Dropout:
      return 'dropout';
    case WheelFormat.BattleRoyal:
      return 'battle-royale';
    case WheelFormat.Default:
    default:
      return 'default';
  }
};

const mapDropoutVariant = (
  format: WheelFormat,
  dropoutVariant: DropoutVariant,
): AnalyticsEventMap[typeof analyticsEventNames.wheelSpinResult]['dropoutVariant'] => {
  if (format !== WheelFormat.Dropout) {
    return 'none';
  }

  return dropoutVariant === DropoutVariant.Classic ? 'classic' : 'new';
};

/**
 * Builds a stable analytics payload for the winner that was decided by the final spin.
 * Item collections are used only to calculate aggregate statistics here and are never
 * returned in the analytics payload.
 */
export const buildWheelSpinResultPayload = ({
  settings,
  allItems,
  finalSpinItems,
  winnerId,
  spinDuration,
}: BuildWheelSpinResultPayloadParams): AnalyticsEventMap[typeof analyticsEventNames.wheelSpinResult] => {
  const normalizedAllItems = normalizeItems(allItems);
  const normalizedFinalSpinItems = normalizeItems(finalSpinItems);

  const totalStatistics = calculateWheelStatistics(normalizedAllItems);
  const finalSpinStatistics = calculateWheelStatistics(normalizedFinalSpinItems);

  const winnerFromAllItems = normalizedAllItems.find(({ id }) => id === winnerId);
  const winnerFromFinalSpinItems = normalizedFinalSpinItems.find(({ id }) => id === winnerId);

  if (!winnerFromAllItems || !winnerFromFinalSpinItems) {
    throw new Error('Winner not found in items');
  }

  return {
    format: mapWheelFormat(settings.format),
    dropoutVariant: mapDropoutVariant(settings.format, settings.dropoutVariant),
    randomnessSource: settings.randomnessSource,
    configuredSpinTimeSeconds: settings.spinTime,
    actualSpinTimeSeconds: spinDuration,
    isRandomSpinEnabled: settings.randomSpinEnabled,
    randomSpinMinSeconds: settings.randomSpinEnabled ? settings.randomSpinConfig.min : null,
    randomSpinMaxSeconds: settings.randomSpinEnabled ? settings.randomSpinConfig.max : null,
    split: settings.split,
    wheelStyle: settings.wheelStyles ?? null,
    hasCoreImage: Boolean(settings.coreImage),
    soundtrackEnabled: Boolean(settings.soundtrack?.enabled),
    soundtrackSourceType: settings.soundtrack?.enabled ? settings.soundtrack?.source?.type ?? 'none' : 'none',
    maxDepth: settings.maxDepth,
    depthRestriction: settings.depthRestriction,
    totalParticipantCount: totalStatistics.participantCount,
    finalSpinParticipantCount: finalSpinStatistics.participantCount,
    totalWeight: totalStatistics.totalWeight,
    finalSpinWeight: finalSpinStatistics.totalWeight,
    minWeight: totalStatistics.minWeight,
    maxWeight: totalStatistics.maxWeight,
    averageWeight: totalStatistics.averageWeight,
    winnerId: String(winnerId),
    winnerName: winnerFromAllItems.name,
    winnerWeight: winnerFromAllItems.amount,
    winnerChancePercentTotal: calculateWinnerChancePercent(winnerFromAllItems.amount, totalStatistics.totalWeight),
    winnerChancePercentFinalSpin: calculateWinnerChancePercent(
      winnerFromFinalSpinItems.amount,
      finalSpinStatistics.totalWeight,
    ),
  };
};
