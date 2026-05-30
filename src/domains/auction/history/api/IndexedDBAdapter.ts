import Dexie, { type EntityTable } from 'dexie';

import { AUCTION_HISTORY_DB_NAME } from '../model/constants';
import { resolveNextDefaultAuctionName } from '../lib/derived';

import AuctionHistoryApi, { type AuctionHistoryDetails, type AuctionHistoryRangeDetails } from './AuctionHistoryApi';

import type {
  AuctionHistoryAuction,
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
  AuctionHistoryWinnerEvent,
} from '../model/types';

class AuctionHistoryDatabase extends Dexie {
  auctions!: EntityTable<AuctionHistoryAuction, 'id'>;
  lots!: EntityTable<AuctionHistoryLot, 'id'>;
  participants!: EntityTable<AuctionHistoryParticipant, 'id'>;
  contributions!: EntityTable<AuctionHistoryContribution, 'id'>;
  winnerEvents!: EntityTable<AuctionHistoryWinnerEvent, 'id'>;

  constructor() {
    super(AUCTION_HISTORY_DB_NAME);
    this.version(1).stores({
      auctions: 'id, name, startedAt, endedAt, selectionMethod',
      lots: 'id, auctionId',
      participants: 'id, platformKey, displayName, wonLotCount, auctionCount',
      contributions:
        'id, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId]',
      winnerEvents: 'id, auctionId, lotId, status, createdAt, [auctionId+status]',
    });
  }
}

class IndexedDBAdapter extends AuctionHistoryApi {
  private db: AuctionHistoryDatabase;

  constructor() {
    super();
    this.db = new AuctionHistoryDatabase();
  }

  async getAuctions(): Promise<AuctionHistoryAuction[]> {
    const auctions = await this.db.auctions.toArray();
    return auctions.sort((first, second) => new Date(second.startedAt).getTime() - new Date(first.startedAt).getTime());
  }

  async getAuctionsByDateRange(startAt: string, endAt: string): Promise<AuctionHistoryAuction[]> {
    const auctions = await this.db.auctions.where('startedAt').between(startAt, endAt, true, true).toArray();
    return auctions.sort((first, second) => new Date(second.startedAt).getTime() - new Date(first.startedAt).getTime());
  }

  async getParticipants(): Promise<AuctionHistoryParticipant[]> {
    return this.db.participants.toArray();
  }

  async getDetails(auctionId: string): Promise<AuctionHistoryDetails | null> {
    const auction = await this.db.auctions.get(auctionId);
    if (!auction) {
      return null;
    }

    const [lots, contributions, winnerEvents] = await Promise.all([
      this.db.lots.where('auctionId').equals(auctionId).toArray(),
      this.db.contributions.where('auctionId').equals(auctionId).toArray(),
      this.db.winnerEvents.where('auctionId').equals(auctionId).toArray(),
    ]);

    return {
      auction,
      lots,
      contributions,
      winnerEvents: winnerEvents.sort(
        (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      ),
    };
  }

  async getRangeDetails(startAt: string, endAt: string): Promise<AuctionHistoryRangeDetails> {
    const auctions = await this.getAuctionsByDateRange(startAt, endAt);
    const auctionIds = auctions.map((auction) => auction.id);

    if (auctionIds.length === 0) {
      return {
        lots: [],
        contributions: [],
        winnerEvents: [],
      };
    }

    const [lots, contributions, winnerEvents] = await Promise.all([
      this.db.lots.where('auctionId').anyOf(auctionIds).toArray(),
      this.db.contributions.where('auctionId').anyOf(auctionIds).toArray(),
      this.db.winnerEvents.where('auctionId').anyOf(auctionIds).toArray(),
    ]);

    return {
      lots,
      contributions,
      winnerEvents: winnerEvents.sort(
        (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      ),
    };
  }

  async saveSnapshot(snapshot: AuctionHistorySnapshot): Promise<void> {
    await this.db.transaction(
      'rw',
      [this.db.auctions, this.db.lots, this.db.participants, this.db.contributions, this.db.winnerEvents],
      async () => {
        await this.db.auctions.put(snapshot.auction);
        await this.db.lots.bulkPut(snapshot.lots);
        await this.db.contributions.bulkPut(snapshot.contributions);
        await this.db.winnerEvents.bulkPut(snapshot.winnerEvents);

        const existingParticipants = await this.db.participants.bulkGet(
          snapshot.participants.map((participant) => participant.id),
        );

        const participants = snapshot.participants.map<AuctionHistoryParticipant>((participant, index) => {
          const existing = existingParticipants[index];
          if (!existing) {
            return participant;
          }

          return {
            ...participant,
            displayName: participant.displayName,
            auctionCount: existing.auctionCount + 1,
            wonLotCount: existing.wonLotCount + participant.wonLotCount,
            bidCount: existing.bidCount + participant.bidCount,
            totalPoints: existing.totalPoints + participant.totalPoints,
            totalDonationCents: existing.totalDonationCents + participant.totalDonationCents,
            firstSeenAt:
              new Date(existing.firstSeenAt).getTime() < new Date(participant.firstSeenAt).getTime()
                ? existing.firstSeenAt
                : participant.firstSeenAt,
            lastSeenAt:
              new Date(existing.lastSeenAt).getTime() > new Date(participant.lastSeenAt).getTime()
                ? existing.lastSeenAt
                : participant.lastSeenAt,
          };
        });

        if (participants.length > 0) {
          await this.db.participants.bulkPut(participants);
        }
      },
    );
  }

  async getNextDefaultName(): Promise<string> {
    const auctions = await this.db.auctions.toArray();
    return resolveNextDefaultAuctionName(auctions);
  }
}

const auctionHistoryApi = new IndexedDBAdapter();
export default auctionHistoryApi;
