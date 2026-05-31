import {
  calculateWeightedDonationPoints,
  calculateWeightedTotalPoints,
  getAuctionCurrencyMode,
  getAuctionDayKey,
} from './derived';

import type { LotContributor } from '@models/slot.model';
import type { AuctionHistoryRangeDetails } from '../api/AuctionHistoryApi';
import type {
  AuctionHistoryAuction,
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySelectionMethod,
  AuctionHistoryWinnerEvent,
} from '../model/types';

export type HeatmapMode = 'combined' | 'points' | 'donations' | 'auctionCount';
export type LeaderboardSort = 'wins' | 'points' | 'donations' | 'participation' | 'streak';

export interface ParticipantScore {
  id: string;
  displayName: string;
  wins: number;
  points: number;
  donationCents: number;
  participation: number;
  streak: number;
  bidCount: number;
  joinedLotCount: number;
}

export interface AuctionCardSummary {
  auction: AuctionHistoryAuction;
  bidCount: number;
  currencyMode: ReturnType<typeof getAuctionCurrencyMode>;
  flavor: StatusFlavor;
  winnerLot?: AuctionHistoryLot;
  winnerContributors: LotContributor[];
  winnerChancePercent?: number;
}

export interface StatusFlavor {
  key: 'popular' | 'quickBurst' | 'longRun' | 'highRollerNight' | 'lotsFestival' | 'underdogVictory';
  color: string;
  icon: 'sparkles' | 'zap' | 'clock' | 'gem' | 'stack' | 'dice';
}

export interface RangeTotals {
  totalAuctions: number;
  totalParticipants: number;
  totalBids: number;
  totalPoints: number;
  totalDonationCents: number;
  biggestWinningLot?: AuctionHistoryLot;
  averageParticipants: number;
  weightedTotal: number;
  weightedDonationPoints: number;
}

export interface ContextStat {
  key: string;
  labelKey: string;
  value: string;
  helper?: string;
}

const statusFlavors: Record<StatusFlavor['key'], StatusFlavor> = {
  popular: { key: 'popular', color: 'cyan', icon: 'sparkles' },
  quickBurst: { key: 'quickBurst', color: 'yellow', icon: 'zap' },
  longRun: { key: 'longRun', color: 'indigo', icon: 'clock' },
  highRollerNight: { key: 'highRollerNight', color: 'grape', icon: 'gem' },
  lotsFestival: { key: 'lotsFestival', color: 'orange', icon: 'stack' },
  underdogVictory: { key: 'underdogVictory', color: 'pink', icon: 'dice' },
};

const compareNumbers = (first: number, second: number): number => first - second;

const getPercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) {
    return 0;
  }

  const sortedValues = [...values].sort(compareNumbers);
  const index = Math.min(sortedValues.length - 1, Math.ceil((percentile / 100) * sortedValues.length) - 1);
  return sortedValues[index] ?? 0;
};

const getAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const groupBy = <TValue, TKey extends string>(
  values: TValue[],
  getKey: (value: TValue) => TKey,
): Map<TKey, TValue[]> => {
  const grouped = new Map<TKey, TValue[]>();

  values.forEach((value) => {
    const key = getKey(value);
    const group = grouped.get(key);
    if (group) {
      group.push(value);
      return;
    }

    grouped.set(key, [value]);
  });

  return grouped;
};

export const createParticipantNameResolver = (participants: AuctionHistoryParticipant[]) => {
  const participantById = new Map(participants.map((participant) => [participant.id, participant]));

  return (participantId: string): string => participantById.get(participantId)?.displayName ?? participantId;
};

export const getConfirmedWinnerEvent = (
  winnerEvents: AuctionHistoryWinnerEvent[],
): AuctionHistoryWinnerEvent | undefined => {
  return [...winnerEvents].reverse().find((event) => event.status === 'confirmed');
};

export const getBiggestLot = (lots: AuctionHistoryLot[]): AuctionHistoryLot | undefined => {
  return [...lots].sort((first, second) => second.totalAmount - first.totalAmount)[0];
};

export const getEffectiveWinnerLot = (
  lots: AuctionHistoryLot[],
  winnerEvents: AuctionHistoryWinnerEvent[],
): AuctionHistoryLot | undefined => {
  const winnerEvent = getConfirmedWinnerEvent(winnerEvents);
  return (winnerEvent ? lots.find((lot) => lot.id === winnerEvent.lotId) : undefined) ?? getBiggestLot(lots);
};

export const getContributionWeightedTotal = (
  contribution: Pick<AuctionHistoryContribution, 'points' | 'donationCents'>,
  pointsToDonationRatio: number,
): number => {
  return calculateWeightedTotalPoints(contribution.points, contribution.donationCents, pointsToDonationRatio);
};

export const getTopContributorName = (
  lotId: string,
  contributions: AuctionHistoryContribution[],
  resolveParticipantName: (participantId: string) => string,
  pointsToDonationRatio: number,
): string | undefined => {
  const topContribution = contributions
    .filter((contribution) => contribution.lotId === lotId)
    .sort((first, second) => {
      const firstTotal = getContributionWeightedTotal(first, pointsToDonationRatio);
      const secondTotal = getContributionWeightedTotal(second, pointsToDonationRatio);
      return secondTotal - firstTotal;
    })[0];

  return topContribution ? resolveParticipantName(topContribution.participantId) : undefined;
};

export const getLotContributors = (
  lotId: string,
  contributions: AuctionHistoryContribution[],
  resolveParticipantName: (participantId: string) => string,
  pointsToDonationRatio: number,
): LotContributor[] => {
  return contributions
    .filter((contribution) => contribution.lotId === lotId)
    .map((contribution) => ({
      name: resolveParticipantName(contribution.participantId),
      amount: getContributionWeightedTotal(contribution, pointsToDonationRatio),
    }))
    .sort((first, second) => second.amount - first.amount);
};

export const getAuctionWeightedTotal = (auction: AuctionHistoryAuction): number => {
  return calculateWeightedTotalPoints(auction.totalPoints, auction.totalDonationCents, auction.pointsToDonationRatio);
};

export const getAuctionTotalAmount = (
  auction: Pick<AuctionHistoryAuction, 'totalAmount'>,
  fallbackTotalAmount = 0,
): number => {
  const totalAmount = Number(auction.totalAmount);
  return Number.isFinite(totalAmount) ? totalAmount : fallbackTotalAmount;
};

export const resolveRangeTotals = (
  auctions: AuctionHistoryAuction[],
  rangeDetails: AuctionHistoryRangeDetails,
): RangeTotals => {
  // Range-level aggregates are computed from already-loaded IndexedDB rows.
  // This stays O(auctions + contributions + lots) for ranges with hundreds of
  // auctions and hundreds of thousands of contribution records.
  const participantIds = new Set(rangeDetails.contributions.map((contribution) => contribution.participantId));
  const totalBids = rangeDetails.contributions.reduce((sum, contribution) => sum + contribution.bidsCount, 0);
  const totalPoints = auctions.reduce((sum, auction) => sum + auction.totalPoints, 0);
  const totalDonationCents = auctions.reduce((sum, auction) => sum + auction.totalDonationCents, 0);
  const winnerEventsByAuctionId = groupBy(rangeDetails.winnerEvents, (event) => event.auctionId);
  const lotsByAuctionId = groupBy(rangeDetails.lots, (lot) => lot.auctionId);
  const effectiveWinningLotIds = new Set(
    auctions
      .map((auction) =>
        getEffectiveWinnerLot(lotsByAuctionId.get(auction.id) ?? [], winnerEventsByAuctionId.get(auction.id) ?? []),
      )
      .filter((lot): lot is AuctionHistoryLot => lot != null)
      .map((lot) => lot.id),
  );
  const biggestWinningLot = rangeDetails.lots
    .filter((lot) => effectiveWinningLotIds.has(lot.id))
    .sort((first, second) => second.totalAmount - first.totalAmount)[0];
  const weightedDonationPoints = auctions.reduce(
    (sum, auction) => sum + calculateWeightedDonationPoints(auction.totalDonationCents, auction.pointsToDonationRatio),
    0,
  );

  return {
    totalAuctions: auctions.length,
    totalParticipants: participantIds.size || auctions.reduce((sum, auction) => sum + auction.participantCount, 0),
    totalBids,
    totalPoints,
    totalDonationCents,
    biggestWinningLot,
    averageParticipants: auctions.length
      ? auctions.reduce((sum, auction) => sum + auction.participantCount, 0) / auctions.length
      : 0,
    weightedTotal: auctions.reduce((sum, auction) => sum + getAuctionWeightedTotal(auction), 0),
    weightedDonationPoints,
  };
};

export const buildAuctionCardSummaries = (
  auctions: AuctionHistoryAuction[],
  rangeDetails: AuctionHistoryRangeDetails,
  resolveParticipantName: (participantId: string) => string,
): AuctionCardSummary[] => {
  // Cards need winner, bid count, and flavor metadata. Grouping once avoids
  // repeatedly scanning the full contribution set for every rendered auction.
  const lotsByAuctionId = groupBy(rangeDetails.lots, (lot) => lot.auctionId);
  const contributionsByAuctionId = groupBy(rangeDetails.contributions, (contribution) => contribution.auctionId);
  const winnerEventsByAuctionId = groupBy(rangeDetails.winnerEvents, (event) => event.auctionId);
  const participantAverage = getAverage(auctions.map((auction) => auction.participantCount));
  const participantPercentile = getPercentile(
    auctions.map((auction) => auction.participantCount),
    75,
  );
  const durationAverage = getAverage(auctions.map((auction) => auction.durationMs));
  const durationPercentile = getPercentile(
    auctions.map((auction) => auction.durationMs),
    75,
  );
  const combinedValues = auctions.map(getAuctionWeightedTotal);
  const combinedPercentile = getPercentile(combinedValues, 75);
  const lotsPercentile = getPercentile(
    auctions.map((auction) => auction.lotCount),
    75,
  );
  const contributionPercentile = getPercentile(
    auctions.map((item) => (item.participantCount ? getAuctionWeightedTotal(item) / item.participantCount : 0)),
    75,
  );

  return auctions.map((auction) => {
    const auctionLots = lotsByAuctionId.get(auction.id) ?? [];
    const auctionContributions = contributionsByAuctionId.get(auction.id) ?? [];
    const auctionWinnerEvents = winnerEventsByAuctionId.get(auction.id) ?? [];
    const winnerEvent = getConfirmedWinnerEvent(auctionWinnerEvents);
    const winnerLot = getEffectiveWinnerLot(auctionLots, auctionWinnerEvents);
    const winnerContributors = winnerLot
      ? getLotContributors(winnerLot.id, auctionContributions, resolveParticipantName, auction.pointsToDonationRatio)
      : [];
    const combinedTotal = getAuctionWeightedTotal(auction);
    const contributionPerParticipant = auction.participantCount ? combinedTotal / auction.participantCount : 0;
    const winnerParticipationPercent =
      winnerLot && auctionContributions.length > 0
        ? (auctionContributions.filter((contribution) => contribution.lotId === winnerLot.id).length /
            auctionContributions.length) *
          100
        : 100;
    let flavor: StatusFlavor = statusFlavors.popular;

    const getLotPercentage = (amount: number) => {
      return (amount / auction.lotCount) * 100;
    };

    if (auction.selectionMethod === 'wheel' && winnerParticipationPercent <= 5) {
      flavor = statusFlavors.underdogVictory;
    } else if (auction.lotCount >= lotsPercentile && lotsPercentile > 0) {
      flavor = statusFlavors.lotsFestival;
    } else if (contributionPerParticipant >= contributionPercentile && contributionPercentile > 0) {
      flavor = statusFlavors.highRollerNight;
    } else if (auction.durationMs >= durationPercentile && durationPercentile > 0) {
      flavor = statusFlavors.longRun;
    } else if (auction.durationMs < durationAverage && combinedTotal >= combinedPercentile) {
      flavor = statusFlavors.quickBurst;
    } else if (auction.participantCount >= Math.max(participantAverage, participantPercentile)) {
      flavor = statusFlavors.popular;
    }

    return {
      auction,
      bidCount: auctionContributions.reduce((sum, contribution) => sum + contribution.bidsCount, 0),
      currencyMode: getAuctionCurrencyMode(auction),
      flavor,
      winnerLot,
      winnerContributors,
      winnerChancePercent: winnerEvent?.chancePercent,
    };
  });
};

export const buildHeatmapData = (auctions: AuctionHistoryAuction[], mode: HeatmapMode): Record<string, number> => {
  const dayAuctions = groupBy(auctions, getAuctionDayKey);
  const dayPointTotals = Array.from(dayAuctions.entries()).map(([dayKey, items]) => ({
    dayKey,
    points: items.reduce((sum, auction) => sum + auction.totalPoints, 0),
    donations: items.reduce((sum, auction) => sum + auction.totalDonationCents, 0),
    count: items.length,
  }));
  const maxPoints = Math.max(1, ...dayPointTotals.map((item) => item.points));
  const maxDonations = Math.max(1, ...dayPointTotals.map((item) => item.donations));

  return Object.fromEntries(
    dayPointTotals.map((item) => {
      if (mode === 'points') {
        return [item.dayKey, item.points];
      }

      if (mode === 'donations') {
        return [item.dayKey, item.donations / 100];
      }

      if (mode === 'auctionCount') {
        return [item.dayKey, item.count];
      }

      return [item.dayKey, Math.round((item.points / maxPoints) * 50 + (item.donations / maxDonations) * 50)];
    }),
  );
};

export const buildWeekdayActivity = (auctions: AuctionHistoryAuction[]) => {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  auctions.forEach((auction) => {
    const weekday = new Date(auction.startedAt).getDay();
    const mondayFirstIndex = weekday === 0 ? 6 : weekday - 1;
    counts[mondayFirstIndex] += 1;
  });

  return counts.map((count, index) => ({
    key: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][index],
    count,
    percent: auctions.length ? Math.round((count / auctions.length) * 100) : 0,
  }));
};

export const buildParticipantScores = (
  auctions: AuctionHistoryAuction[],
  rangeDetails: AuctionHistoryRangeDetails,
  resolveParticipantName: (participantId: string) => string,
): ParticipantScore[] => {
  // Contributions are stored per auction/lot/participant. The leaderboard
  // collapses them by participant and then derives range-specific participation
  // and streaks from the selected auction order.
  const scoreByParticipantId = new Map<string, ParticipantScore>();
  const winnerEventsByAuctionId = groupBy(rangeDetails.winnerEvents, (event) => event.auctionId);
  const lotsByAuctionId = groupBy(rangeDetails.lots, (lot) => lot.auctionId);
  const effectiveWinningLotIds = new Set(
    auctions
      .map((auction) =>
        getEffectiveWinnerLot(lotsByAuctionId.get(auction.id) ?? [], winnerEventsByAuctionId.get(auction.id) ?? []),
      )
      .filter((lot): lot is AuctionHistoryLot => lot != null)
      .map((lot) => lot.id),
  );

  rangeDetails.contributions.forEach((contribution) => {
    const score = scoreByParticipantId.get(contribution.participantId) ?? {
      id: contribution.participantId,
      displayName: resolveParticipantName(contribution.participantId),
      wins: 0,
      points: 0,
      donationCents: 0,
      participation: 0,
      streak: 0,
      bidCount: 0,
      joinedLotCount: 0,
    };

    score.points += contribution.points;
    score.donationCents += contribution.donationCents;
    score.bidCount += contribution.bidsCount;
    score.joinedLotCount += 1;

    if (effectiveWinningLotIds.has(contribution.lotId)) {
      score.wins += 1;
    }

    scoreByParticipantId.set(contribution.participantId, score);
  });

  const sortedAuctions = [...auctions].sort(
    (first, second) => new Date(first.startedAt).getTime() - new Date(second.startedAt).getTime(),
  );
  const auctionParticipationByParticipantId = new Map<string, Set<string>>();

  rangeDetails.contributions.forEach((contribution) => {
    const auctionIds = auctionParticipationByParticipantId.get(contribution.participantId) ?? new Set<string>();
    auctionIds.add(contribution.auctionId);
    auctionParticipationByParticipantId.set(contribution.participantId, auctionIds);
  });

  scoreByParticipantId.forEach((score) => {
    const auctionIds = auctionParticipationByParticipantId.get(score.id) ?? new Set<string>();
    let currentStreak = 0;
    let longestStreak = 0;
    sortedAuctions.forEach((auction) => {
      if (auctionIds.has(auction.id)) {
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    score.participation = auctionIds.size;
    score.streak = longestStreak;
  });

  return Array.from(scoreByParticipantId.values());
};

export const sortParticipantScores = (scores: ParticipantScore[], sort: LeaderboardSort): ParticipantScore[] => {
  return [...scores].sort((first, second) => {
    if (sort === 'donations') {
      return second.donationCents - first.donationCents;
    }

    if (sort === 'points') {
      return second.points - first.points;
    }

    if (sort === 'participation') {
      return second.participation - first.participation;
    }

    if (sort === 'streak') {
      return second.streak - first.streak;
    }

    return second.wins - first.wins;
  });
};

export const getSelectionMethodIconLabel = (method: AuctionHistorySelectionMethod): 'direct' | 'wheel' => method;
