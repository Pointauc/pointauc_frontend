import { createSlot } from '@reducers/Slots/Slots';
import { sortSlots } from '@utils/common.utils';

import { calculateWeightedTotalPoints } from './derived';

import type { AuctionHistoryDetails } from '../api/AuctionHistoryApi';
import type { AuctionHistoryParticipant } from '../model/types';
import type { Lot } from '@models/slot.model';

export const buildRestoredAuctionLots = (
  details: AuctionHistoryDetails,
  participants: AuctionHistoryParticipant[],
): Lot[] => {
  const participantNameById = new Map(participants.map((participant) => [participant.id, participant.displayName]));

  const lots = details.lots.map((lot, index) => {
    const contributors = details.contributions
      .filter((contribution) => contribution.lotId === lot.id)
      .map((contribution) => ({
        name: participantNameById.get(contribution.participantId) ?? contribution.participantId,
        amount: calculateWeightedTotalPoints(
          contribution.points,
          contribution.donationCents,
          details.auction.pointsToDonationRatio,
        ),
      }))
      .sort((first, second) => second.amount - first.amount);

    return createSlot({
      fastId: index + 1,
      name: lot.name,
      amount: Number(lot.totalAmount ?? 0),
      contributors,
      isFavorite: false,
      lockedPercentage: null,
    });
  });

  return sortSlots(lots.length > 0 ? lots : [createSlot({ fastId: 1 })]);
};
