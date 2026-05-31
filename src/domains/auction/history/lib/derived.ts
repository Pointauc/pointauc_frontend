import { DEFAULT_AUCTION_NAME_PREFIXES, resolveDefaultAuctionNamePrefix } from '../model/constants';

import { getCurrentAuctionMetadata } from './currentAuctionMetadata';

import type { AuctionHistoryAuction, AuctionHistoryDropoutVariant, AuctionHistoryWheelVariant } from '../model/types';

export const calculateWeightedDonationPoints = (donationCents: number, pointsToDonationRatio: number): number => {
  return (donationCents / 100) * pointsToDonationRatio;
};

export const calculateWeightedTotalPoints = (
  points: number,
  donationCents: number,
  pointsToDonationRatio: number,
): number => {
  return points + calculateWeightedDonationPoints(donationCents, pointsToDonationRatio);
};

export const getAuctionDayKey = (auction: Pick<AuctionHistoryAuction, 'startedAt'>): string => {
  return auction.startedAt.slice(0, 10);
};

export const getAuctionWeekday = (auction: Pick<AuctionHistoryAuction, 'startedAt'>): number => {
  return new Date(auction.startedAt).getDay();
};

export const getAuctionCurrencyMode = (
  auction: Pick<AuctionHistoryAuction, 'totalPoints' | 'totalDonationCents'>,
): 'points' | 'donations' | 'hybrid' => {
  if (auction.totalPoints > 0 && auction.totalDonationCents > 0) {
    return 'hybrid';
  }

  return auction.totalDonationCents > 0 ? 'donations' : 'points';
};

export const formatAuctionCurrencyMode = (
  mode: ReturnType<typeof getAuctionCurrencyMode>,
  t: (key: string) => string,
): string => t(`auctionHistory.currencyMode.${mode}`);

export const resolveNextDefaultAuctionName = (
  auctions: Pick<AuctionHistoryAuction, 'name'>[],
  language?: string,
): string => {
  const defaultAuctionNamePrefix = resolveDefaultAuctionNamePrefix(language);
  const usedNumbers = new Set<number>();

  const addSequenceNumber = (name: string) => {
    const matchingPrefix = DEFAULT_AUCTION_NAME_PREFIXES.find((prefix) => name.startsWith(prefix));

    if (!matchingPrefix) {
      return;
    }

    const sequenceNumber = Number(name.slice(matchingPrefix.length));
    if (Number.isInteger(sequenceNumber) && sequenceNumber > 0) {
      usedNumbers.add(sequenceNumber);
    }
  };

  const currentAuctionName = getCurrentAuctionMetadata().name;
  if (currentAuctionName) {
    addSequenceNumber(currentAuctionName);
  }

  auctions.forEach(({ name }) => {
    addSequenceNumber(name);
  });

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `${defaultAuctionNamePrefix}${nextNumber}`;
};

export const formatWheelVariant = (variant: AuctionHistoryWheelVariant | undefined): string => {
  if (variant === 'battleRoyal') {
    return 'battle-royale';
  }

  return variant ?? 'default';
};

export const formatDropoutVariant = (variant: AuctionHistoryDropoutVariant | undefined): string => variant ?? 'none';
