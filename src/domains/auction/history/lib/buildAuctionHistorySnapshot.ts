import { PurchaseStatusEnum } from '@models/purchase';

import { AUCTION_HISTORY_SCHEMA_VERSION } from '../model/constants';

import type {
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
  AuctionHistoryWinnerEvent,
  BuildAuctionHistorySnapshotParams,
} from '../model/types';

interface ParticipantAccumulator {
  id: string;
  displayName: string;
  platformKey: Bid.Source | 'unknown';
  bidCount: number;
  totalPoints: number;
  totalDonationCents: number;
}

interface ContributionAccumulator {
  id: string;
  auctionId: string;
  lotId: string;
  participantId: string;
  points: number;
  donationCents: number;
  bidsCount: number;
}

const normalizeUsername = (username: string | undefined): string => {
  const normalized = username?.trim().toLowerCase();
  return normalized || 'anonymous';
};

const resolveParticipantId = (source: Bid.Source | undefined, investorId: string | undefined, username: string): string => {
  const platformKey = source ?? 'unknown';
  const identity = investorId?.trim() || normalizeUsername(username);

  return `${platformKey}:${identity}`;
};

const centsFromDonation = (cost: number): number => Math.round(cost * 100);

const createEmptyLotTotals = (lot: AuctionHistoryLot): AuctionHistoryLot => ({
  ...lot,
  totalPoints: 0,
  totalDonationCents: 0,
});

export const buildAuctionHistorySnapshot = ({
  auctionId,
  auctionName,
  requestsKind,
  startedAt,
  endedAt,
  durationMs,
  pointsToDonationRatio,
  lots,
  purchases,
  pendingWinnerEvents,
}: BuildAuctionHistorySnapshotParams): AuctionHistorySnapshot => {
  const normalizedDurationMs = Math.max(0, durationMs);
  const activeLots = lots.filter((lot) => Boolean(lot.name) || Number(lot.amount ?? 0) > 0);
  const lotIdByRuntimeId = new Map<string, string>();
  const historyLots = activeLots.map<AuctionHistoryLot>((lot) => {
    const historyLotId = crypto.randomUUID();
    lotIdByRuntimeId.set(lot.id, historyLotId);

    return createEmptyLotTotals({
      id: historyLotId,
      auctionId,
      name: lot.name,
      totalAmount: Number(lot.amount ?? 0),
      totalPoints: 0,
      totalDonationCents: 0,
    });
  });
  const lotById = new Map(historyLots.map((lot) => [lot.id, lot]));
  const runtimeLotIds = new Set(activeLots.map((lot) => lot.id));
  const participantsById = new Map<string, ParticipantAccumulator>();
  const contributionsById = new Map<string, ContributionAccumulator>();

  purchases.forEach((purchase) => {
    if (purchase.status !== PurchaseStatusEnum.Processed || !purchase.target || !runtimeLotIds.has(purchase.target)) {
      return;
    }

    const lotId = lotIdByRuntimeId.get(purchase.target);
    if (!lotId) {
      return;
    }

    const platformKey = purchase.source ?? 'unknown';
    const displayName = purchase.username?.trim() || 'Anonymous';
    const participantId = resolveParticipantId(purchase.source, purchase.investorId, displayName);
    const contributionId = `${auctionId}:${lotId}:${participantId}`;
    const rawCost = Number(purchase.rawCost ?? purchase.cost ?? 0);
    const points = purchase.isDonation ? 0 : rawCost;
    const donationCents = purchase.isDonation ? centsFromDonation(rawCost) : 0;

    const participant = participantsById.get(participantId) ?? {
      id: participantId,
      displayName,
      platformKey,
      bidCount: 0,
      totalPoints: 0,
      totalDonationCents: 0,
    };
    participant.displayName = displayName;
    participant.bidCount += 1;
    participant.totalPoints += points;
    participant.totalDonationCents += donationCents;
    participantsById.set(participantId, participant);

    const contribution = contributionsById.get(contributionId) ?? {
      id: contributionId,
      auctionId,
      lotId,
      participantId,
      points: 0,
      donationCents: 0,
      bidsCount: 0,
    };
    contribution.points += points;
    contribution.donationCents += donationCents;
    contribution.bidsCount += 1;
    contributionsById.set(contributionId, contribution);

    const lot = lotById.get(lotId);
    if (lot) {
      lot.totalPoints += points;
      lot.totalDonationCents += donationCents;
    }
  });

  const winnerEvents = pendingWinnerEvents
    .map<AuctionHistoryWinnerEvent | null>((event) => {
      const lotId = lotIdByRuntimeId.get(event.runtimeLotId);
      if (!lotId) {
        return null;
      }

      return {
        id: crypto.randomUUID(),
        auctionId,
        lotId,
        method: event.method,
        status: event.status,
        randomNumber: event.randomNumber,
        chancePercent: event.chancePercent,
        wheelVariant: event.wheelVariant,
        dropoutVariant: event.dropoutVariant,
        createdAt: event.createdAt,
      };
    })
    .filter((event): event is AuctionHistoryWinnerEvent => event != null);

  const latestCandidate = [...winnerEvents].reverse().find((event) => event.status === 'candidate');
  if (latestCandidate) {
    latestCandidate.status = 'confirmed';
  }

  const confirmedWinnerLotIds = new Set(
    winnerEvents.filter((event) => event.status === 'confirmed').map((event) => event.lotId),
  );
  const wonLotCountByParticipantId = new Map<string, number>();

  Array.from(contributionsById.values()).forEach((contribution) => {
    if (confirmedWinnerLotIds.has(contribution.lotId)) {
      wonLotCountByParticipantId.set(
        contribution.participantId,
        (wonLotCountByParticipantId.get(contribution.participantId) ?? 0) + 1,
      );
    }
  });

  const participants = Array.from(participantsById.values()).map<AuctionHistoryParticipant>((participant) => ({
    id: participant.id,
    displayName: participant.displayName,
    platformKey: participant.platformKey,
    auctionCount: 1,
    wonLotCount: wonLotCountByParticipantId.get(participant.id) ?? 0,
    bidCount: participant.bidCount,
    totalPoints: participant.totalPoints,
    totalDonationCents: participant.totalDonationCents,
    firstSeenAt: startedAt,
    lastSeenAt: endedAt,
  }));

  const totalAmount = historyLots.reduce((sum, lot) => sum + lot.totalAmount, 0);
  const totalPoints = historyLots.reduce((sum, lot) => sum + lot.totalPoints, 0);
  const totalDonationCents = historyLots.reduce((sum, lot) => sum + lot.totalDonationCents, 0);

  return {
    auction: {
      id: auctionId,
      name: auctionName,
      requestsKind,
      startedAt,
      endedAt,
      durationMs: normalizedDurationMs,
      selectionMethod: winnerEvents.some((event) => event.method === 'wheel') ? 'wheel' : 'direct',
      pointsToDonationRatio,
      lotCount: historyLots.length,
      participantCount: participants.length,
      totalAmount,
      totalPoints,
      totalDonationCents,
      createdAt: endedAt,
      schemaVersion: AUCTION_HISTORY_SCHEMA_VERSION,
    },
    lots: historyLots,
    contributions: Array.from(contributionsById.values()),
    participants,
    winnerEvents,
  };
};
