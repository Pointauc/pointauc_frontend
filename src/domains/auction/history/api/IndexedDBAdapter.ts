import Dexie, { type EntityTable } from 'dexie';

import i18n from '@assets/i18n';

import { AUCTION_HISTORY_DB_NAME } from '../model/constants';
import { resolveNextDefaultAuctionName } from '../lib/derived';
import { ANONYMOUS_USER_ID, getActiveUserId, getLastActiveUserId } from '../lib/userContext';

import AuctionHistoryApi, { type AuctionHistoryDetails, type AuctionHistoryRangeDetails } from './AuctionHistoryApi';

import type {
  AuctionHistoryAuction,
  AuctionHistoryBid,
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
  AuctionHistoryWinnerEvent,
  SyncQueueItem,
} from '../model/types';

export class AuctionHistoryDatabase extends Dexie {
  auctions!: EntityTable<AuctionHistoryAuction, 'id'>;
  lots!: EntityTable<AuctionHistoryLot, 'id'>;
  bids!: EntityTable<AuctionHistoryBid, 'id'>;
  contributions!: EntityTable<AuctionHistoryContribution, 'id'>;
  winnerEvents!: EntityTable<AuctionHistoryWinnerEvent, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  userParticipants!: EntityTable<AuctionHistoryParticipant, 'syncKey'>;

  get participants(): EntityTable<AuctionHistoryParticipant, 'syncKey'> {
    return this.userParticipants;
  }

  constructor(dbName = AUCTION_HISTORY_DB_NAME) {
    super(dbName);

    this.version(1).stores({
      auctions: 'id, name, startedAt, endedAt, selectionMethod',
      lots: 'id, auctionId',
      participants: 'id, platformKey, displayName, wonLotCount, auctionCount',
      contributions:
        'id, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId]',
      winnerEvents: 'id, auctionId, lotId, status, createdAt, [auctionId+status]',
    });

    this.version(2)
      .stores({
        auctions: 'id, userId, name, startedAt, endedAt, selectionMethod, [userId+startedAt]',
        lots: 'id, userId, auctionId, [userId+auctionId]',
        userParticipants: 'syncKey, id, userId, platformKey, displayName, wonLotCount, auctionCount',
        contributions:
          'id, userId, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId], [userId+auctionId]',
        winnerEvents: 'id, userId, auctionId, lotId, status, createdAt, [auctionId+status], [userId+auctionId]',
        syncQueue: 'id, userId, operation, entityType, entityId, createdAt',
      })
      .upgrade(async (tx) => {
        const defaultUserId = getLastActiveUserId() || ANONYMOUS_USER_ID;

        // Migrating legacy participants: copy to userParticipants table with syncKey
        try {
          const oldParticipants = await tx.table('participants').toArray();
          if (oldParticipants.length > 0) {
            const migrated = oldParticipants.map((item) => {
              const userId = item.userId || defaultUserId;
              return {
                ...item,
                userId,
                syncKey: item.syncKey || `${userId}:${item.id}`,
              };
            });
            await tx.table('userParticipants').bulkPut(migrated);
          }
        } catch {
          // table might not exist on clean installs
        }

        await Promise.all([
          tx.table('auctions').toCollection().modify((item) => {
            if (!item.userId) item.userId = defaultUserId;
          }),
          tx.table('lots').toCollection().modify((item) => {
            if (!item.userId) item.userId = defaultUserId;
          }),
          tx.table('contributions').toCollection().modify((item) => {
            if (!item.userId) item.userId = defaultUserId;
          }),
          tx.table('winnerEvents').toCollection().modify((item) => {
            if (!item.userId) item.userId = defaultUserId;
          }),
        ]);
      });

    this.version(3).stores({
      participants: null,
    });

    this.version(4)
      .stores({
        auctions: 'id, userId, name, startedAt, endedAt, selectionMethod, [userId+startedAt]',
        lots: 'id, userId, auctionId, [userId+auctionId]',
        userParticipants: 'syncKey, id, userId, platformKey, displayName, wonLotCount, auctionCount',
        contributions:
          'id, userId, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId], [userId+auctionId]',
        bids:
          'id, userId, auctionId, lotId, participantId, kind, [userId+auctionId], [auctionId+lotId], [auctionId+participantId], createdAt',
        winnerEvents: 'id, userId, auctionId, lotId, status, createdAt, [auctionId+status], [userId+auctionId]',
        syncQueue: 'id, userId, operation, entityType, entityId, createdAt',
      })
      .upgrade(async (tx) => {
        try {
          const oldContributions = await tx.table('contributions').toArray();
          if (oldContributions.length > 0) {
            const auctions = await tx.table('auctions').toArray();
            const auctionMap = new Map(auctions.map((a) => [a.id, a]));
            const defaultUserId = getLastActiveUserId() || ANONYMOUS_USER_ID;
            const migratedBids: AuctionHistoryBid[] = [];

            for (const c of oldContributions) {
              const auction = auctionMap.get(c.auctionId);
              const userId = c.userId || auction?.userId || defaultUserId;
              const defaultCreatedAt = auction?.endedAt || auction?.startedAt || new Date().toISOString();

              if (c.points > 0) {
                migratedBids.push({
                  id: `${c.id}:migrated:points`,
                  userId,
                  auctionId: c.auctionId,
                  lotId: c.lotId,
                  participantId: c.participantId,
                  kind: 'points',
                  amount_cents: c.points,
                  amountCents: c.points,
                  currency: null,
                  createdAt: defaultCreatedAt,
                });
              }
              if (c.donationCents > 0) {
                migratedBids.push({
                  id: `${c.id}:migrated:money`,
                  userId,
                  auctionId: c.auctionId,
                  lotId: c.lotId,
                  participantId: c.participantId,
                  kind: 'money',
                  amount_cents: c.donationCents,
                  amountCents: c.donationCents,
                  currency: 'RUB',
                  createdAt: defaultCreatedAt,
                });
              }
              if (c.points === 0 && c.donationCents === 0) {
                migratedBids.push({
                  id: `${c.id}:migrated:bid`,
                  userId,
                  auctionId: c.auctionId,
                  lotId: c.lotId,
                  participantId: c.participantId,
                  kind: 'points',
                  amount_cents: 0,
                  amountCents: 0,
                  currency: null,
                  createdAt: defaultCreatedAt,
                });
              }
            }

            if (migratedBids.length > 0) {
              await tx.table('bids').bulkPut(migratedBids);
            }
          }
        } catch {
          // Table might not exist on clean installs or already migrated
        }
      });
  }
}

export class IndexedDBAdapter extends AuctionHistoryApi {
  public db: AuctionHistoryDatabase;

  constructor(db?: AuctionHistoryDatabase) {
    super();
    this.db = db ?? new AuctionHistoryDatabase();
  }

  deriveBidsFromContributions(
    contributions: AuctionHistoryContribution[],
    defaultCreatedAt: string,
  ): AuctionHistoryBid[] {
    const bids: AuctionHistoryBid[] = [];
    for (const c of contributions) {
      if (c.points > 0) {
        bids.push({
          id: `${c.id}:points`,
          userId: c.userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'points',
          amount_cents: c.points,
          amountCents: c.points,
          currency: null,
          createdAt: defaultCreatedAt,
        });
      }
      if (c.donationCents > 0) {
        bids.push({
          id: `${c.id}:money`,
          userId: c.userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'money',
          amount_cents: c.donationCents,
          amountCents: c.donationCents,
          currency: 'RUB',
          createdAt: defaultCreatedAt,
        });
      }
      if (c.points === 0 && c.donationCents === 0) {
        bids.push({
          id: `${c.id}:bid`,
          userId: c.userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'points',
          amount_cents: 0,
          amountCents: 0,
          currency: null,
          createdAt: defaultCreatedAt,
        });
      }
    }
    return bids;
  }

  deriveContributionsFromBids(bids: AuctionHistoryBid[]): AuctionHistoryContribution[] {
    const map = new Map<string, AuctionHistoryContribution>();
    for (const b of bids) {
      const key = `${b.auctionId}:${b.lotId}:${b.participantId}`;
      const existing = map.get(key) ?? {
        id: key,
        userId: b.userId,
        auctionId: b.auctionId,
        lotId: b.lotId,
        participantId: b.participantId,
        points: 0,
        donationCents: 0,
        bidsCount: 0,
      };
      const amount = Number(b.amount_cents ?? b.amountCents ?? 0);
      if (b.kind === 'points') {
        existing.points += amount;
      } else {
        existing.donationCents += amount;
      }
      existing.bidsCount += 1;
      map.set(key, existing);
    }
    return Array.from(map.values());
  }

  async getAuctions(userId = getActiveUserId()): Promise<AuctionHistoryAuction[]> {
    const auctions = await this.db.auctions
      .where('userId')
      .equals(userId)
      .toArray();

    return auctions.sort(
      (first, second) => new Date(second.startedAt).getTime() - new Date(first.startedAt).getTime(),
    );
  }

  async getAuctionsByDateRange(
    startAt: string,
    endAt: string,
    userId = getActiveUserId(),
  ): Promise<AuctionHistoryAuction[]> {
    const auctions = await this.db.auctions
      .where('userId')
      .equals(userId)
      .filter((auction) => auction.startedAt >= startAt && auction.startedAt <= endAt)
      .toArray();

    return auctions.sort(
      (first, second) => new Date(second.startedAt).getTime() - new Date(first.startedAt).getTime(),
    );
  }

  async getParticipants(userId = getActiveUserId()): Promise<AuctionHistoryParticipant[]> {
    return this.db.participants
      .where('userId')
      .equals(userId)
      .toArray();
  }

  async restoreFromLegacyContributions(userId = getActiveUserId()): Promise<number> {
    const legacyContribs = await this.db.contributions.where('userId').equals(userId).toArray();
    if (legacyContribs.length === 0) return 0;
    const auctions = await this.db.auctions.where('userId').equals(userId).toArray();
    const auctionMap = new Map(auctions.map((a) => [a.id, a]));
    const restoredBids: AuctionHistoryBid[] = [];
    for (const c of legacyContribs) {
      const auction = auctionMap.get(c.auctionId);
      const createdAt = auction?.endedAt || auction?.startedAt || new Date().toISOString();
      if (c.points > 0) {
        restoredBids.push({
          id: `${c.id}:restored:points`,
          userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'points',
          amount_cents: c.points,
          amountCents: c.points,
          currency: null,
          createdAt,
        });
      }
      if (c.donationCents > 0) {
        restoredBids.push({
          id: `${c.id}:restored:money`,
          userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'money',
          amount_cents: c.donationCents,
          amountCents: c.donationCents,
          currency: 'RUB',
          createdAt,
        });
      }
      if (c.points === 0 && c.donationCents === 0) {
        restoredBids.push({
          id: `${c.id}:restored:bid`,
          userId,
          auctionId: c.auctionId,
          lotId: c.lotId,
          participantId: c.participantId,
          kind: 'points',
          amount_cents: 0,
          amountCents: 0,
          currency: null,
          createdAt,
        });
      }
    }
    if (restoredBids.length > 0) {
      await this.db.bids.bulkPut(restoredBids);
    }
    return restoredBids.length;
  }

  async getDetails(auctionId: string, userId = getActiveUserId()): Promise<AuctionHistoryDetails | null> {
    const auction = await this.db.auctions.get(auctionId);
    if (!auction || (auction.userId && auction.userId !== userId)) {
      return null;
    }

    const [lots, bids, winnerEvents] = await Promise.all([
      this.db.lots.where('auctionId').equals(auctionId).toArray(),
      this.db.bids.where('auctionId').equals(auctionId).toArray(),
      this.db.winnerEvents.where('auctionId').equals(auctionId).toArray(),
    ]);

    let effectiveBids = bids;

    // Self-healing: if bids is empty but old contributions exist in IndexedDB, restore bids
    if (effectiveBids.length === 0) {
      const legacyContributions = await this.db.contributions.where('auctionId').equals(auctionId).toArray();
      if (legacyContributions.length > 0) {
        effectiveBids = this.deriveBidsFromContributions(legacyContributions, auction.endedAt);
      }
    }

    return {
      auction,
      lots,
      bids: effectiveBids,
      contributions: this.deriveContributionsFromBids(effectiveBids),
      winnerEvents: winnerEvents.sort(
        (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      ),
    };
  }

  async getRangeDetails(
    startAt: string,
    endAt: string,
    userId = getActiveUserId(),
  ): Promise<AuctionHistoryRangeDetails> {
    const auctions = await this.getAuctionsByDateRange(startAt, endAt, userId);
    const auctionIds = auctions.map((auction) => auction.id);

    if (auctionIds.length === 0) {
      return {
        lots: [],
        bids: [],
        contributions: [],
        winnerEvents: [],
      };
    }

    const [lots, bids, winnerEvents] = await Promise.all([
      this.db.lots.where('auctionId').anyOf(auctionIds).toArray(),
      this.db.bids.where('auctionId').anyOf(auctionIds).toArray(),
      this.db.winnerEvents.where('auctionId').anyOf(auctionIds).toArray(),
    ]);

    let effectiveBids = bids;

    if (effectiveBids.length === 0) {
      const legacyContributions = await this.db.contributions.where('auctionId').anyOf(auctionIds).toArray();
      if (legacyContributions.length > 0) {
        effectiveBids = this.deriveBidsFromContributions(legacyContributions, new Date().toISOString());
      }
    }

    return {
      lots,
      bids: effectiveBids,
      contributions: this.deriveContributionsFromBids(effectiveBids),
      winnerEvents: winnerEvents.sort(
        (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      ),
    };
  }

  private deriveParticipantsFromAuction(
    auction: AuctionHistoryAuction,
    bids: AuctionHistoryBid[],
    winnerEvents: AuctionHistoryWinnerEvent[],
    userId: string,
    providedParticipants: AuctionHistoryParticipant[] = [],
  ): AuctionHistoryParticipant[] {
    const metaMap = new Map(providedParticipants.map((p) => [p.id, p]));
    const confirmedWinnerLotIds = new Set(
      winnerEvents.filter((event) => event.status === 'confirmed').map((event) => event.lotId),
    );

    const participantAdjustments = new Map<
      string,
      { bidCount: number; points: number; donationCents: number; wonLotIds: Set<string> }
    >();

    bids.forEach((b) => {
      const adj = participantAdjustments.get(b.participantId) ?? {
        bidCount: 0,
        points: 0,
        donationCents: 0,
        wonLotIds: new Set<string>(),
      };
      adj.bidCount += 1;
      const amt = Math.max(0, Number(b.amount_cents ?? b.amountCents ?? 0) || 0);
      if (b.kind === 'points') {
        adj.points += amt;
      } else {
        adj.donationCents += amt;
      }
      if (confirmedWinnerLotIds.has(b.lotId)) {
        adj.wonLotIds.add(b.lotId);
      }
      participantAdjustments.set(b.participantId, adj);
    });

    const allParticipantIds = Array.from(
      new Set([...Array.from(participantAdjustments.keys()), ...metaMap.keys()]),
    );

    return allParticipantIds.map((pId) => {
      const pMeta = metaMap.get(pId);
      const stats = participantAdjustments.get(pId) ?? {
        bidCount: 0,
        points: 0,
        donationCents: 0,
        wonLotIds: new Set<string>(),
      };
      const platformKey = (pMeta?.platformKey ?? (pId.includes(':') ? pId.split(':')[0] : 'unknown')) as any;
      const displayName = pMeta?.displayName ?? (pId.includes(':') ? pId.split(':')[1] : 'Anonymous');

      return {
        id: pId,
        syncKey: `${userId}:${pId}`,
        userId,
        displayName,
        platformKey,
        auctionCount: 1,
        wonLotCount: stats.wonLotIds.size,
        bidCount: stats.bidCount,
        totalPoints: stats.points,
        totalDonationCents: stats.donationCents,
        firstSeenAt: pMeta?.firstSeenAt || auction.startedAt,
        lastSeenAt: pMeta?.lastSeenAt || auction.endedAt,
      };
    });
  }

  async saveSnapshot(snapshot: AuctionHistorySnapshot, userId = getActiveUserId()): Promise<void> {
    const scopedAuction: AuctionHistoryAuction = { ...snapshot.auction, userId };
    const scopedLots = snapshot.lots.map((lot) => ({ ...lot, userId }));
    const seenBidIds = new Set<string>();
    let scopedBids = (snapshot.bids || []).map((b) => {
      let bidId = b.id?.trim();
      if (!bidId || seenBidIds.has(bidId)) {
        bidId = crypto.randomUUID();
      }
      seenBidIds.add(bidId);
      const amt = Math.max(0, Number(b.amount_cents ?? b.amountCents ?? 0) || 0);
      const curr = b.kind === 'points' ? null : (b.currency ? b.currency.trim().toUpperCase().slice(0, 3) : null);
      return {
        ...b,
        id: bidId,
        userId,
        amount_cents: amt,
        amountCents: amt,
        currency: curr,
      };
    });

    if (scopedBids.length === 0 && snapshot.contributions && snapshot.contributions.length > 0) {
      scopedBids = this.deriveBidsFromContributions(snapshot.contributions, scopedAuction.endedAt).map((b) => ({
        ...b,
        userId,
      }));
    }

    const scopedWinnerEvents = snapshot.winnerEvents.map((w) => ({ ...w, userId }));

    await this.db.transaction(
      'rw',
      [this.db.auctions, this.db.lots, this.db.bids, this.db.participants, this.db.contributions, this.db.winnerEvents],
      async () => {
        // If auction already exists locally, clean up previous version to prevent duplicate lots/bids
        const existingAuction = await this.db.auctions.get(scopedAuction.id);
        if (existingAuction) {
          await this.deleteAuctionInternal(scopedAuction.id, userId);
        }

        await this.db.auctions.put(scopedAuction);
        if (scopedLots.length > 0) {
          await this.db.lots.bulkPut(scopedLots);
        }
        if (scopedBids.length > 0) {
          await this.db.bids.bulkPut(scopedBids);
        }
        if (scopedWinnerEvents.length > 0) {
          await this.db.winnerEvents.bulkPut(scopedWinnerEvents);
        }

        const participantsToApply = this.deriveParticipantsFromAuction(
          scopedAuction,
          scopedBids,
          scopedWinnerEvents,
          userId,
          snapshot.participants,
        );

        if (participantsToApply.length > 0) {
          const existingUserParticipants = await this.db.participants
            .where('userId')
            .equals(userId)
            .toArray();
          const existingMap = new Map(existingUserParticipants.map((p) => [p.id, p]));

          const nextParticipants = participantsToApply.map<AuctionHistoryParticipant>((participant) => {
            const syncKey = `${userId}:${participant.id}`;
            const existing = existingMap.get(participant.id);
            if (!existing) {
              return { ...participant, syncKey, userId, auctionCount: 1 };
            }

            return {
              ...participant,
              syncKey,
              userId,
              displayName: participant.displayName || existing.displayName,
              platformKey: participant.platformKey || existing.platformKey,
              auctionCount: existing.auctionCount + 1,
              wonLotCount: existing.wonLotCount + (participant.wonLotCount || 0),
              bidCount: existing.bidCount + (participant.bidCount || 0),
              totalPoints: existing.totalPoints + (participant.totalPoints || 0),
              totalDonationCents: existing.totalDonationCents + (participant.totalDonationCents || 0),
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

          await this.db.participants.bulkPut(nextParticipants);
        }
      },
    );
  }

  async deleteAuction(auctionId: string, userId = getActiveUserId()): Promise<void> {
    await this.db.transaction(
      'rw',
      [this.db.auctions, this.db.lots, this.db.bids, this.db.participants, this.db.contributions, this.db.winnerEvents],
      async () => {
        await this.deleteAuctionInternal(auctionId, userId);
      },
    );
  }

  private async deleteAuctionInternal(auctionId: string, userId: string): Promise<void> {
    const [bids, contributions, winnerEvents] = await Promise.all([
      this.db.bids.where('auctionId').equals(auctionId).toArray(),
      this.db.contributions.where('auctionId').equals(auctionId).toArray(),
      this.db.winnerEvents.where('auctionId').equals(auctionId).toArray(),
    ]);

    const participantIds = Array.from(
      new Set([
        ...bids.map((b) => b.participantId),
        ...contributions.map((c) => c.participantId),
      ]),
    );

    const existingUserParticipants = await this.db.participants
      .where('userId')
      .equals(userId)
      .toArray();
    const existingMap = new Map(existingUserParticipants.map((p) => [p.id, p]));

    const confirmedWinnerLotIds = new Set(
      winnerEvents.filter((event) => event.status === 'confirmed').map((event) => event.lotId),
    );

    const participantAdjustments = new Map<
      string,
      { bidCount: number; totalPoints: number; totalDonationCents: number; wonLotIds: Set<string> }
    >();

    if (bids.length > 0) {
      bids.forEach((b) => {
        const adjustment = participantAdjustments.get(b.participantId) ?? {
          bidCount: 0,
          totalPoints: 0,
          totalDonationCents: 0,
          wonLotIds: new Set<string>(),
        };
        adjustment.bidCount += 1;
        const amount = Number(b.amount_cents ?? b.amountCents ?? 0);
        if (b.kind === 'points') {
          adjustment.totalPoints += amount;
        } else {
          adjustment.totalDonationCents += amount;
        }
        if (confirmedWinnerLotIds.has(b.lotId)) {
          adjustment.wonLotIds.add(b.lotId);
        }
        participantAdjustments.set(b.participantId, adjustment);
      });
    } else {
      contributions.forEach((contribution) => {
        const adjustment = participantAdjustments.get(contribution.participantId) ?? {
          bidCount: 0,
          totalPoints: 0,
          totalDonationCents: 0,
          wonLotIds: new Set<string>(),
        };

        adjustment.bidCount += contribution.bidsCount;
        adjustment.totalPoints += contribution.points;
        adjustment.totalDonationCents += contribution.donationCents;
        if (confirmedWinnerLotIds.has(contribution.lotId)) {
          adjustment.wonLotIds.add(contribution.lotId);
        }
        participantAdjustments.set(contribution.participantId, adjustment);
      });
    }

    const nextParticipants = participantIds
      .map((id) => existingMap.get(id))
      .filter((participant): participant is AuctionHistoryParticipant => participant != null)
      .map((participant) => {
        const adjustment = participantAdjustments.get(participant.id);
        if (!adjustment) {
          return participant;
        }

        return {
          ...participant,
          auctionCount: Math.max(0, participant.auctionCount - 1),
          wonLotCount: Math.max(0, participant.wonLotCount - adjustment.wonLotIds.size),
          bidCount: Math.max(0, participant.bidCount - adjustment.bidCount),
          totalPoints: Math.max(0, participant.totalPoints - adjustment.totalPoints),
          totalDonationCents: Math.max(0, participant.totalDonationCents - adjustment.totalDonationCents),
        };
      });

    await Promise.all([
      this.db.auctions.delete(auctionId),
      this.db.lots.where('auctionId').equals(auctionId).delete(),
      this.db.bids.where('auctionId').equals(auctionId).delete(),
      this.db.contributions.where('auctionId').equals(auctionId).delete(),
      this.db.winnerEvents.where('auctionId').equals(auctionId).delete(),
    ]);

    const participantsToDelete = nextParticipants
      .filter((participant) => participant.auctionCount === 0 || participant.bidCount === 0)
      .map((participant) => participant.syncKey || `${userId}:${participant.id}`);
    const participantsToUpdate = nextParticipants
      .filter(
        (participant) => !participantsToDelete.includes(participant.syncKey || `${userId}:${participant.id}`),
      )
      .map((participant) => ({
        ...participant,
        syncKey: participant.syncKey || `${userId}:${participant.id}`,
        userId,
      }));

    await Promise.all([
      participantsToDelete.length ? this.db.participants.bulkDelete(participantsToDelete) : Promise.resolve(),
      participantsToUpdate.length ? this.db.participants.bulkPut(participantsToUpdate) : Promise.resolve(),
    ]);
  }

  async getNextDefaultName(language = i18n.language, userId = getActiveUserId()): Promise<string> {
    const auctions = await this.getAuctions(userId);
    return resolveNextDefaultAuctionName(auctions, language);
  }

  // --- Sync Queue Helpers ---

  async enqueueSync(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };
    await this.db.syncQueue.put(queueItem);
    return id;
  }

  async getPendingSyncItems(userId = getActiveUserId()): Promise<SyncQueueItem[]> {
    return this.db.syncQueue
      .where('userId')
      .equals(userId)
      .toArray();
  }

  async removeSyncItem(id: string): Promise<void> {
    await this.db.syncQueue.delete(id);
  }

  // --- Anonymous Promotion ---

  async getAnonymousAuctions(): Promise<AuctionHistoryAuction[]> {
    return this.db.auctions
      .where('userId')
      .equals(ANONYMOUS_USER_ID)
      .toArray();
  }

  async promoteAnonymousAuction(auctionId: string, targetUserId: string): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.auctions,
        this.db.lots,
        this.db.bids,
        this.db.participants,
        this.db.contributions,
        this.db.winnerEvents,
        this.db.syncQueue,
      ],
      async () => {
        const auction = await this.db.auctions.get(auctionId);
        if (!auction) return;

        // 1. Update auction
        await this.db.auctions.put({ ...auction, userId: targetUserId });

        // 2. Update lots, bids, contributions, winner events
        const [lots, bids, contributions, winnerEvents] = await Promise.all([
          this.db.lots.where('auctionId').equals(auctionId).toArray(),
          this.db.bids.where('auctionId').equals(auctionId).toArray(),
          this.db.contributions.where('auctionId').equals(auctionId).toArray(),
          this.db.winnerEvents.where('auctionId').equals(auctionId).toArray(),
        ]);

        if (lots.length > 0) {
          await this.db.lots.bulkPut(lots.map((l) => ({ ...l, userId: targetUserId })));
        }
        if (bids.length > 0) {
          await this.db.bids.bulkPut(bids.map((b) => ({ ...b, userId: targetUserId })));
        }
        if (contributions.length > 0) {
          await this.db.contributions.bulkPut(contributions.map((c) => ({ ...c, userId: targetUserId })));
        }
        if (winnerEvents.length > 0) {
          await this.db.winnerEvents.bulkPut(winnerEvents.map((w) => ({ ...w, userId: targetUserId })));
        }

        // 3. Migrate / accumulate participants into target user based on this auction's bids (or contributions) & winner events
        const confirmedWinnerLotIds = new Set(
          winnerEvents.filter((event) => event.status === 'confirmed').map((event) => event.lotId),
        );

        const participantAdjustments = new Map<
          string,
          { bidCount: number; points: number; donationCents: number; wonLotIds: Set<string> }
        >();

        if (bids.length > 0) {
          bids.forEach((b) => {
            const adj = participantAdjustments.get(b.participantId) ?? {
              bidCount: 0,
              points: 0,
              donationCents: 0,
              wonLotIds: new Set<string>(),
            };
            adj.bidCount += 1;
            const amt = Number(b.amount_cents ?? b.amountCents ?? 0);
            if (b.kind === 'points') {
              adj.points += amt;
            } else {
              adj.donationCents += amt;
            }
            if (confirmedWinnerLotIds.has(b.lotId)) {
              adj.wonLotIds.add(b.lotId);
            }
            participantAdjustments.set(b.participantId, adj);
          });
        } else {
          contributions.forEach((c) => {
            const adj = participantAdjustments.get(c.participantId) ?? {
              bidCount: 0,
              points: 0,
              donationCents: 0,
              wonLotIds: new Set<string>(),
            };
            adj.bidCount += c.bidsCount;
            adj.points += c.points;
            adj.donationCents += c.donationCents;
            if (confirmedWinnerLotIds.has(c.lotId)) {
              adj.wonLotIds.add(c.lotId);
            }
            participantAdjustments.set(c.participantId, adj);
          });
        }

        const participantIds = Array.from(participantAdjustments.keys());
        const [targetParticipants, anonParticipants] = await Promise.all([
          this.db.participants.where('userId').equals(targetUserId).toArray(),
          this.db.participants.where('userId').equals(ANONYMOUS_USER_ID).toArray(),
        ]);

        const targetMap = new Map(targetParticipants.map((p) => [p.id, p]));
        const anonMap = new Map(anonParticipants.map((p) => [p.id, p]));

        const updatedTargetParticipants: AuctionHistoryParticipant[] = [];
        const anonToDelete: string[] = [];
        const anonToUpdate: AuctionHistoryParticipant[] = [];

        for (const pId of participantIds) {
          const adj = participantAdjustments.get(pId)!;
          const anonP = anonMap.get(pId);
          const existingTarget = targetMap.get(pId);

          const displayName =
            existingTarget?.displayName ?? anonP?.displayName ?? (pId.includes(':') ? pId.split(':')[1] : 'Anonymous');
          const platformKey = (existingTarget?.platformKey ??
            anonP?.platformKey ??
            (pId.includes(':') ? pId.split(':')[0] : 'unknown')) as any;

          // Adjust Anonymous participant (decrement or delete)
          if (anonP) {
            const remainingAuctionCount = Math.max(0, anonP.auctionCount - 1);
            const remainingBidCount = Math.max(0, anonP.bidCount - adj.bidCount);

            if (remainingAuctionCount === 0 || remainingBidCount === 0) {
              anonToDelete.push(anonP.syncKey || `${ANONYMOUS_USER_ID}:${pId}`);
            } else {
              anonToUpdate.push({
                ...anonP,
                auctionCount: remainingAuctionCount,
                wonLotCount: Math.max(0, anonP.wonLotCount - adj.wonLotIds.size),
                bidCount: remainingBidCount,
                totalPoints: Math.max(0, anonP.totalPoints - adj.points),
                totalDonationCents: Math.max(0, anonP.totalDonationCents - adj.donationCents),
              });
            }
          }

          // Adjust Target User participant (increment or insert)
          if (existingTarget) {
            updatedTargetParticipants.push({
              ...existingTarget,
              syncKey: `${targetUserId}:${pId}`,
              userId: targetUserId,
              displayName,
              platformKey,
              auctionCount: existingTarget.auctionCount + 1,
              wonLotCount: existingTarget.wonLotCount + adj.wonLotIds.size,
              bidCount: existingTarget.bidCount + adj.bidCount,
              totalPoints: existingTarget.totalPoints + adj.points,
              totalDonationCents: existingTarget.totalDonationCents + adj.donationCents,
              lastSeenAt:
                new Date(existingTarget.lastSeenAt).getTime() > new Date(auction.endedAt).getTime()
                  ? existingTarget.lastSeenAt
                  : auction.endedAt,
            });
          } else {
            updatedTargetParticipants.push({
              id: pId,
              syncKey: `${targetUserId}:${pId}`,
              userId: targetUserId,
              displayName,
              platformKey,
              auctionCount: 1,
              wonLotCount: adj.wonLotIds.size,
              bidCount: adj.bidCount,
              totalPoints: adj.points,
              totalDonationCents: adj.donationCents,
              firstSeenAt: auction.startedAt,
              lastSeenAt: auction.endedAt,
            });
          }
        }

        if (anonToDelete.length > 0) {
          await this.db.participants.bulkDelete(anonToDelete);
        }
        if (anonToUpdate.length > 0) {
          await this.db.participants.bulkPut(anonToUpdate);
        }
        if (updatedTargetParticipants.length > 0) {
          await this.db.participants.bulkPut(updatedTargetParticipants);
        }

        // Clean up syncQueue entries for this auction under anonymous
        const anonSyncItems = await this.db.syncQueue
          .where('userId')
          .equals(ANONYMOUS_USER_ID)
          .filter((item) => item.entityId === auctionId)
          .toArray();

        if (anonSyncItems.length > 0) {
          await this.db.syncQueue.bulkDelete(anonSyncItems.map((item) => item.id));
        }
      },
    );
  }
}

const indexedDBAdapter = new IndexedDBAdapter();
export default indexedDBAdapter;
