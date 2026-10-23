import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backendApi } from '@api/backendApi';

import indexedDBAdapter, { AuctionHistoryDatabase, IndexedDBAdapter } from '../api/IndexedDBAdapter';
import { HybridAuctionHistoryAdapter } from '../api/HybridAuctionHistoryAdapter';

import {
  registerConflictHandler,
  syncAuctionHistory,
  type AuctionSyncConflict,
  type ConflictResolutionChoice,
} from './syncService';
import { ANONYMOUS_USER_ID } from './userContext';

import type { AuctionHistoryDetails } from '../api/AuctionHistoryApi';
import type {
  AuctionHistoryAuction,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
} from '../model/types';

describe('Auction History Hybrid Storage & Multi-Device Sync (integration)', () => {
  let db: AuctionHistoryDatabase;
  let localAdapter: IndexedDBAdapter;
  let hybridAdapter: HybridAuctionHistoryAdapter;

  const USER_101 = '101';
  const USER_102 = '102';

  const AUCTION_A_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const AUCTION_B_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

  const auctionA: AuctionHistoryAuction = {
    id: AUCTION_A_ID,
    userId: USER_101,
    name: 'Auction Alpha (Browser 1)',
    requestsKind: 'any',
    startedAt: '2026-10-20T10:00:00.000Z',
    endedAt: '2026-10-20T11:00:00.000Z',
    durationMs: 3600000,
    selectionMethod: 'wheel',
    pointsToDonationRatio: 1,
    lotCount: 1,
    participantCount: 1,
    totalAmount: 1000,
    totalPoints: 1000,
    totalDonationCents: 0,
    createdAt: '2026-10-20T11:00:00.000Z',
    schemaVersion: 1,
  };

  const lotA: AuctionHistoryLot = {
    id: 'lot-a1',
    userId: USER_101,
    auctionId: AUCTION_A_ID,
    name: 'Game A',
    totalAmount: 1000,
    totalPoints: 1000,
    totalDonationCents: 0,
  };

  const participantBobA: AuctionHistoryParticipant = {
    id: 'twitch:bob',
    userId: USER_101,
    displayName: 'Bob',
    platformKey: 'twitch',
    auctionCount: 1,
    wonLotCount: 1,
    bidCount: 5,
    totalPoints: 1000,
    totalDonationCents: 0,
    firstSeenAt: '2026-10-20T10:00:00.000Z',
    lastSeenAt: '2026-10-20T11:00:00.000Z',
  };

  const snapshotA: AuctionHistorySnapshot = {
    auction: auctionA,
    lots: [lotA],
    bids: [
      {
        id: 'bid-a1-1',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-20T10:10:00.000Z',
      },
      {
        id: 'bid-a1-2',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-20T10:20:00.000Z',
      },
      {
        id: 'bid-a1-3',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-20T10:30:00.000Z',
      },
      {
        id: 'bid-a1-4',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-20T10:40:00.000Z',
      },
      {
        id: 'bid-a1-5',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-20T10:50:00.000Z',
      },
    ],
    contributions: [
      {
        id: `${AUCTION_A_ID}:lot-a1:twitch:bob`,
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        participantId: 'twitch:bob',
        points: 1000,
        donationCents: 0,
        bidsCount: 5,
      },
    ],
    participants: [participantBobA],
    winnerEvents: [
      {
        id: 'win-a1',
        userId: USER_101,
        auctionId: AUCTION_A_ID,
        lotId: 'lot-a1',
        method: 'wheel',
        status: 'confirmed',
        createdAt: '2026-10-20T11:00:00.000Z',
      },
    ],
  };

  const auctionB: AuctionHistoryAuction = {
    id: AUCTION_B_ID,
    userId: ANONYMOUS_USER_ID,
    name: 'Auction Beta (Browser 2 Guest)',
    requestsKind: 'game',
    startedAt: '2026-10-21T14:00:00.000Z',
    endedAt: '2026-10-21T15:00:00.000Z',
    durationMs: 3600000,
    selectionMethod: 'direct',
    pointsToDonationRatio: 1,
    lotCount: 1,
    participantCount: 1,
    totalAmount: 500,
    totalPoints: 500,
    totalDonationCents: 0,
    createdAt: '2026-10-21T15:00:00.000Z',
    schemaVersion: 1,
  };

  const lotB: AuctionHistoryLot = {
    id: 'lot-b1',
    userId: ANONYMOUS_USER_ID,
    auctionId: AUCTION_B_ID,
    name: 'Game B',
    totalAmount: 500,
    totalPoints: 500,
    totalDonationCents: 0,
  };

  const snapshotB: AuctionHistorySnapshot = {
    auction: auctionB,
    lots: [lotB],
    bids: [
      {
        id: 'bid-b1-1',
        userId: ANONYMOUS_USER_ID,
        auctionId: AUCTION_B_ID,
        lotId: 'lot-b1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 100,
        amountCents: 100,
        currency: null,
        createdAt: '2026-10-21T14:15:00.000Z',
      },
      {
        id: 'bid-b1-2',
        userId: ANONYMOUS_USER_ID,
        auctionId: AUCTION_B_ID,
        lotId: 'lot-b1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-21T14:30:00.000Z',
      },
      {
        id: 'bid-b1-3',
        userId: ANONYMOUS_USER_ID,
        auctionId: AUCTION_B_ID,
        lotId: 'lot-b1',
        participantId: 'twitch:bob',
        kind: 'points',
        amount_cents: 200,
        amountCents: 200,
        currency: null,
        createdAt: '2026-10-21T14:45:00.000Z',
      },
    ],
    contributions: [
      {
        id: `${AUCTION_B_ID}:lot-b1:twitch:bob`,
        userId: ANONYMOUS_USER_ID,
        auctionId: AUCTION_B_ID,
        lotId: 'lot-b1',
        participantId: 'twitch:bob',
        points: 500,
        donationCents: 0,
        bidsCount: 3,
      },
    ],
    participants: [
      {
        id: 'twitch:bob',
        userId: ANONYMOUS_USER_ID,
        displayName: 'Bob',
        platformKey: 'twitch',
        auctionCount: 1,
        wonLotCount: 1,
        bidCount: 3,
        totalPoints: 500,
        totalDonationCents: 0,
        firstSeenAt: '2026-10-21T14:00:00.000Z',
        lastSeenAt: '2026-10-21T15:00:00.000Z',
      },
    ],
    winnerEvents: [
      {
        id: 'win-b1',
        userId: ANONYMOUS_USER_ID,
        auctionId: AUCTION_B_ID,
        lotId: 'lot-b1',
        method: 'direct',
        status: 'confirmed',
        createdAt: '2026-10-21T15:00:00.000Z',
      },
    ],
  };

  beforeEach(async () => {
    localStorage.clear();
    const testDbName = `test-auction-history-${Date.now()}-${Math.random()}`;
    db = new AuctionHistoryDatabase(testDbName);
    localAdapter = new IndexedDBAdapter(db);
    hybridAdapter = new HybridAuctionHistoryAdapter(localAdapter);

    // Point singleton default adapter to our fresh test database
    indexedDBAdapter.db = db;

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await db.delete();
    vi.restoreAllMocks();
  });

  it('Scenario 1: Multi-Browser & Anonymous Promotion Merge', async () => {
    // Step 1: User runs Auction B anonymously on Browser 2
    await localAdapter.saveSnapshot(snapshotB, ANONYMOUS_USER_ID);

    const anonAuctions = await localAdapter.getAuctions(ANONYMOUS_USER_ID);
    expect(anonAuctions).toHaveLength(1);
    expect(anonAuctions[0].id).toBe(AUCTION_B_ID);

    // Step 2: Configure backend mock (Server already holds Auction A from Browser 1)
    const serverAuctions = [{ ...auctionA, userId: USER_101 }];
    const serverParticipants = [{ ...participantBobA, userId: USER_101 }];
    const postCalls: any[] = [];

    vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
      if (url === '/api/auction-history') {
        return { data: serverAuctions } as any;
      }
      if (url === `/api/auction-history/${AUCTION_A_ID}`) {
        const details: AuctionHistoryDetails = {
          auction: { ...auctionA, userId: USER_101 },
          lots: [{ ...lotA, userId: USER_101 }],
          bids: snapshotA.bids.map((b) => ({ ...b, userId: USER_101 })),
          contributions: snapshotA.contributions!.map((c) => ({ ...c, userId: USER_101 })),
          winnerEvents: snapshotA.winnerEvents.map((w) => ({ ...w, userId: USER_101 })),
        };
        return { data: details } as any;
      }
      if (url === '/api/auction-history/participants') {
        return { data: serverParticipants } as any;
      }
      return { data: null } as any;
    });

    vi.spyOn(backendApi, 'post').mockImplementation(async (url: string, body?: any) => {
      postCalls.push({ url, body });
      if (url === '/api/auction-history') {
        if (body?.snapshot?.auction) {
          serverAuctions.push(body.snapshot.auction);
        }
        if (body?.snapshot?.participants) {
          for (const p of body.snapshot.participants) {
            const existing = serverParticipants.find((sp) => sp.id === p.id);
            if (existing) {
              existing.auctionCount += p.auctionCount || 1;
              existing.wonLotCount += p.wonLotCount || 0;
              existing.bidCount += p.bidCount || 0;
              existing.totalPoints += p.totalPoints || 0;
              existing.totalDonationCents += p.totalDonationCents || 0;
            } else {
              serverParticipants.push({ ...p, userId: USER_101 });
            }
          }
        }
        return { data: { success: true } } as any;
      }
      return { data: {} } as any;
    });

    // Step 3: Streamer logs into Account 101 on Browser 2 -> triggers sync
    const result = await syncAuctionHistory(USER_101);

    expect(result.status).toBe('synced');
    expect(result.promotedCount).toBe(1);

    // Step 4: Verify Auction B was uploaded to backend under User 101
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].url).toBe('/api/auction-history');
    expect(postCalls[0].body.snapshot.auction.id).toBe(AUCTION_B_ID);
    expect(postCalls[0].body.snapshot.auction.userId).toBe(USER_101);

    // Step 5: Verify Auction B in local IndexedDB is re-tagged from 'anonymous' to '101'
    const anonAfter = await localAdapter.getAuctions(ANONYMOUS_USER_ID);
    expect(anonAfter).toHaveLength(0);

    // Step 6 & 7: Verify local IndexedDB holds BOTH Auction A and Auction B for User 101
    const user101Auctions = await localAdapter.getAuctions(USER_101);
    expect(user101Auctions).toHaveLength(2);
    expect(user101Auctions.map((a) => a.id)).toContain(AUCTION_A_ID);
    expect(user101Auctions.map((a) => a.id)).toContain(AUCTION_B_ID);

    // Step 8: Verify Bob's participant record was accumulated into User 101
    const participants = await localAdapter.getParticipants(USER_101);
    const bob = participants.find((p) => p.id === 'twitch:bob');
    expect(bob).toBeDefined();
    expect(bob?.auctionCount).toBe(2);
    expect(bob?.wonLotCount).toBe(2);
    expect(bob?.bidCount).toBe(8); // 5 from A + 3 from B
    expect(bob?.totalPoints).toBe(1500); // 1000 + 500
  });

  it('Scenario 2: Offline Deletion Tombstone Sync', async () => {
    // Seed local DB with Auction A for User 101
    await localAdapter.saveSnapshot(snapshotA, USER_101);
    expect(await localAdapter.getAuctions(USER_101)).toHaveLength(1);

    // Simulate offline deletion: backendApi.delete fails with network error
    const deleteCalls: string[] = [];
    vi.spyOn(backendApi, 'delete').mockImplementation(async (url: string) => {
      deleteCalls.push(url);
      throw new Error('Network Error: Offline');
    });

    // Delete via hybridAdapter while offline
    await hybridAdapter.deleteAuction(AUCTION_A_ID, USER_101);

    // 1. Local auction deleted immediately
    expect(await localAdapter.getAuctions(USER_101)).toHaveLength(0);

    // 2. Tombstone queued in syncQueue
    const pendingItems = await localAdapter.getPendingSyncItems(USER_101);
    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0].operation).toBe('delete');
    expect(pendingItems[0].entityId).toBe(AUCTION_A_ID);

    // Reconnection: backend is back online
    vi.spyOn(backendApi, 'delete').mockImplementation(async (url: string) => {
      deleteCalls.push(url);
      return { data: { success: true } } as any;
    });

    vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
      if (url === '/api/auction-history') {
        // Backend returns empty list because Auction A was deleted
        return { data: [] } as any;
      }
      return { data: [] } as any;
    });

    // Run sync upon reconnecting
    await syncAuctionHistory(USER_101);

    // 3. DELETE request sent to server
    expect(deleteCalls).toContain(`/api/auction-history/${AUCTION_A_ID}`);

    // 4. Tombstone removed from queue
    const queueAfter = await localAdapter.getPendingSyncItems(USER_101);
    expect(queueAfter).toHaveLength(0);

    // 5. Auction was not resurrected
    expect(await localAdapter.getAuctions(USER_101)).toHaveLength(0);
  });

  it('Scenario 3: Offline Save Queue & Reconnection Flush', async () => {
    // Simulate offline save: backendApi.post fails
    vi.spyOn(backendApi, 'post').mockRejectedValue(new Error('Network Offline'));

    await hybridAdapter.saveSnapshot(snapshotA, USER_101);

    // Local save succeeded
    expect(await localAdapter.getAuctions(USER_101)).toHaveLength(1);

    // Enqueued in syncQueue
    const pendingItems = await localAdapter.getPendingSyncItems(USER_101);
    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0].operation).toBe('save');
    expect(pendingItems[0].entityId).toBe(AUCTION_A_ID);

    // Reconnection
    const postedSnapshots: any[] = [];
    vi.spyOn(backendApi, 'post').mockImplementation(async (url: string, body?: any) => {
      postedSnapshots.push(body);
      return { data: { success: true } } as any;
    });
    vi.spyOn(backendApi, 'get').mockResolvedValue({ data: [auctionA] } as any);

    await syncAuctionHistory(USER_101);

    // Verified uploaded to server
    expect(postedSnapshots).toHaveLength(1);
    expect(postedSnapshots[0].snapshot.auction.id).toBe(AUCTION_A_ID);

    // Queue flushed
    expect(await localAdapter.getPendingSyncItems(USER_101)).toHaveLength(0);
  });

  it('Scenario 4: Divergent Payload Conflict Detection & Resolution', async () => {
    // Local version has totalAmount = 1000
    await localAdapter.saveSnapshot(snapshotA, USER_101);

    // Remote version has totalAmount = 1500 (conflict!)
    const divergentRemoteAuction: AuctionHistoryAuction = {
      ...auctionA,
      totalAmount: 1500,
    };

    vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
      if (url === '/api/auction-history') {
        return { data: [divergentRemoteAuction] } as any;
      }
      if (url === `/api/auction-history/${AUCTION_A_ID}`) {
        return {
          data: {
            auction: divergentRemoteAuction,
            lots: [lotA],
            bids: snapshotA.bids,
            contributions: snapshotA.contributions,
            winnerEvents: snapshotA.winnerEvents,
          },
        } as any;
      }
      return { data: [] } as any;
    });

    let detectedConflict: AuctionSyncConflict | null = null;
    registerConflictHandler((conflict) => {
      detectedConflict = conflict;
    });

    const postCalls: any[] = [];
    vi.spyOn(backendApi, 'post').mockImplementation(async (url: string, body?: any) => {
      postCalls.push({ url, body });
      return { data: { success: true } } as any;
    });

    // Run sync -> triggers conflict detection
    const result = await syncAuctionHistory(USER_101);
    expect(result.conflictsCount).toBe(1);
    expect(detectedConflict).not.toBeNull();
    expect(detectedConflict!.localAuction.totalAmount).toBe(1000);
    expect(detectedConflict!.remoteAuction.totalAmount).toBe(1500);

    // Resolve conflict by choosing 'local'
    await detectedConflict!.resolve('local');

    // Verify overwrite upload was sent
    const overwriteCall = postCalls.find(
      (c) => c.url === '/api/auction-history' && c.body.overwrite === true,
    );
    expect(overwriteCall).toBeDefined();

    // Verify conflict audit log was sent to backend
    const auditLogCall = postCalls.find((c) => c.url === '/api/auction-history/sync/conflict-log');
    expect(auditLogCall).toBeDefined();
    expect(auditLogCall.body.auctionId).toBe(AUCTION_A_ID);
    expect(auditLogCall.body.resolution).toBe('local');
  });

  it('Scenario 5: Clean Multi-User Account Isolation', async () => {
    // Save Auction A for User 101
    await localAdapter.saveSnapshot(snapshotA, USER_101);

    // Save Auction B for User 102
    await localAdapter.saveSnapshot(
      {
        ...snapshotB,
        auction: { ...auctionB, userId: USER_102 },
      },
      USER_102,
    );

    // User 101 sees ONLY Auction A
    const user101Auctions = await localAdapter.getAuctions(USER_101);
    expect(user101Auctions).toHaveLength(1);
    expect(user101Auctions[0].id).toBe(AUCTION_A_ID);

    // User 102 sees ONLY Auction B
    const user102Auctions = await localAdapter.getAuctions(USER_102);
    expect(user102Auctions).toHaveLength(1);
    expect(user102Auctions[0].id).toBe(AUCTION_B_ID);

    // Participants are isolated per user
    const user101Participants = await localAdapter.getParticipants(USER_101);
    const user102Participants = await localAdapter.getParticipants(USER_102);

    expect(user101Participants).toHaveLength(1);
    expect(user101Participants[0].bidCount).toBe(5);

    expect(user102Participants).toHaveLength(1);
    expect(user102Participants[0].bidCount).toBe(3);
  });

  it('Scenario 6: Multiple Anonymous Auctions Sequential Promotion without data loss or duplication', async () => {
    const AUCTION_C_ID = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
    const snapshotC: AuctionHistorySnapshot = {
      auction: {
        id: AUCTION_C_ID,
        userId: ANONYMOUS_USER_ID,
        name: 'Auction Gamma (Browser 2 Guest 2)',
        requestsKind: 'game',
        startedAt: '2026-10-21T16:00:00.000Z',
        endedAt: '2026-10-21T17:00:00.000Z',
        durationMs: 3600000,
        selectionMethod: 'direct',
        pointsToDonationRatio: 1,
        lotCount: 1,
        participantCount: 2,
        totalAmount: 700,
        totalPoints: 700,
        totalDonationCents: 0,
        createdAt: '2026-10-21T17:00:00.000Z',
        schemaVersion: 1,
      },
      lots: [
        {
          id: 'lot-c1',
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          name: 'Game C',
          totalAmount: 700,
          totalPoints: 700,
          totalDonationCents: 0,
        },
      ],
      bids: [
        {
          id: 'bid-c1-1',
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          participantId: 'twitch:bob',
          kind: 'points',
          amount_cents: 250,
          amountCents: 250,
          currency: null,
          createdAt: '2026-10-21T16:15:00.000Z',
        },
        {
          id: 'bid-c1-2',
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          participantId: 'twitch:bob',
          kind: 'points',
          amount_cents: 250,
          amountCents: 250,
          currency: null,
          createdAt: '2026-10-21T16:30:00.000Z',
        },
        {
          id: 'bid-c1-3',
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          participantId: 'twitch:alice',
          kind: 'points',
          amount_cents: 200,
          amountCents: 200,
          currency: null,
          createdAt: '2026-10-21T16:45:00.000Z',
        },
      ],
      contributions: [
        {
          id: `${AUCTION_C_ID}:lot-c1:twitch:bob`,
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          participantId: 'twitch:bob',
          points: 500,
          donationCents: 0,
          bidsCount: 2,
        },
        {
          id: `${AUCTION_C_ID}:lot-c1:twitch:alice`,
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          participantId: 'twitch:alice',
          points: 200,
          donationCents: 0,
          bidsCount: 1,
        },
      ],
      participants: [
        {
          id: 'twitch:bob',
          userId: ANONYMOUS_USER_ID,
          displayName: 'Bob',
          platformKey: 'twitch',
          auctionCount: 1,
          wonLotCount: 0,
          bidCount: 2,
          totalPoints: 500,
          totalDonationCents: 0,
          firstSeenAt: '2026-10-21T16:00:00.000Z',
          lastSeenAt: '2026-10-21T17:00:00.000Z',
        },
        {
          id: 'twitch:alice',
          userId: ANONYMOUS_USER_ID,
          displayName: 'Alice',
          platformKey: 'twitch',
          auctionCount: 1,
          wonLotCount: 1,
          bidCount: 1,
          totalPoints: 200,
          totalDonationCents: 0,
          firstSeenAt: '2026-10-21T16:00:00.000Z',
          lastSeenAt: '2026-10-21T17:00:00.000Z',
        },
      ],
      winnerEvents: [
        {
          id: 'win-c1',
          userId: ANONYMOUS_USER_ID,
          auctionId: AUCTION_C_ID,
          lotId: 'lot-c1',
          method: 'direct',
          status: 'confirmed',
          createdAt: '2026-10-21T17:00:00.000Z',
        },
      ],
    };

    // User runs Auction B then Auction C anonymously
    await localAdapter.saveSnapshot(snapshotB, ANONYMOUS_USER_ID);
    await localAdapter.saveSnapshot(snapshotC, ANONYMOUS_USER_ID);

    expect(await localAdapter.getAuctions(ANONYMOUS_USER_ID)).toHaveLength(2);

    const postCalls: any[] = [];
    vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
      if (url === '/api/auction-history') return { data: [] } as any;
      if (url === '/api/auction-history/participants') return { data: [] } as any;
      return { data: null } as any;
    });
    vi.spyOn(backendApi, 'post').mockImplementation(async (url: string, body?: any) => {
      postCalls.push({ url, body });
      return { data: { success: true } } as any;
    });

    const result = await syncAuctionHistory(USER_101);
    expect(result.promotedCount).toBe(2);

    // Verify anonymous store is cleared
    expect(await localAdapter.getAuctions(ANONYMOUS_USER_ID)).toHaveLength(0);

    // Verify User 101 has both auctions
    const user101Auctions = await localAdapter.getAuctions(USER_101);
    expect(user101Auctions).toHaveLength(2);

    // Verify participant totals for User 101
    const participants = await localAdapter.getParticipants(USER_101);
    const bob = participants.find((p) => p.id === 'twitch:bob');
    const alice = participants.find((p) => p.id === 'twitch:alice');

    expect(bob).toBeDefined();
    expect(bob?.auctionCount).toBe(2);
    expect(bob?.bidCount).toBe(5); // 3 from B + 2 from C
    expect(bob?.totalPoints).toBe(1000); // 500 from B + 500 from C

    expect(alice).toBeDefined();
    expect(alice?.auctionCount).toBe(1);
    expect(alice?.bidCount).toBe(1);
    expect(alice?.totalPoints).toBe(200);

    // Verify uploads did NOT upload multiplied/all participants for each auction
    const auctionBPost = postCalls.find((c) => c.body?.snapshot?.auction?.id === AUCTION_B_ID);
    const auctionCPost = postCalls.find((c) => c.body?.snapshot?.auction?.id === AUCTION_C_ID);
    expect(auctionBPost).toBeDefined();
    expect(auctionCPost).toBeDefined();

    // Auction B had ONLY Bob
    const bParticipants = auctionBPost.body.snapshot.participants;
    expect(bParticipants).toHaveLength(1);
    expect(bParticipants[0].id).toBe('twitch:bob');
    expect(bParticipants[0].bidCount).toBe(3);
    expect(bParticipants[0].totalPoints).toBe(500);

    // Auction C had Bob and Alice
    const cParticipants = auctionCPost.body.snapshot.participants;
    expect(cParticipants).toHaveLength(2);
    const cBob = cParticipants.find((p: any) => p.id === 'twitch:bob');
    expect(cBob.bidCount).toBe(2);
    expect(cBob.totalPoints).toBe(500);
  });

  it('Scenario 7: Dexie V1 to V2 Schema Upgrade preserves existing records and migrates syncKey', async () => {
    const upgradeDbName = `test-v1-upgrade-${Date.now()}-${Math.random()}`;
    const rawDexieV1 = new Dexie(upgradeDbName);
    rawDexieV1.version(1).stores({
      auctions: 'id, name, startedAt, endedAt, selectionMethod',
      lots: 'id, auctionId',
      participants: 'id, platformKey, displayName, wonLotCount, auctionCount',
      contributions:
        'id, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId]',
      winnerEvents: 'id, auctionId, lotId, status, createdAt, [auctionId+status]',
    });

    await rawDexieV1.open();
    await rawDexieV1.table('auctions').put({
      id: AUCTION_A_ID,
      name: 'Legacy V1 Auction',
      requestsKind: 'any',
      startedAt: '2026-09-01T10:00:00.000Z',
      endedAt: '2026-09-01T11:00:00.000Z',
      durationMs: 3600000,
      selectionMethod: 'wheel',
      pointsToDonationRatio: 1,
      lotCount: 1,
      participantCount: 1,
      totalAmount: 1000,
      totalPoints: 1000,
      totalDonationCents: 0,
      createdAt: '2026-09-01T11:00:00.000Z',
      schemaVersion: 1,
    });
    await rawDexieV1.table('participants').put({
      id: 'twitch:bob',
      displayName: 'Bob Legacy',
      platformKey: 'twitch',
      auctionCount: 1,
      wonLotCount: 1,
      bidCount: 5,
      totalPoints: 1000,
      totalDonationCents: 0,
      firstSeenAt: '2026-09-01T10:00:00.000Z',
      lastSeenAt: '2026-09-01T11:00:00.000Z',
    });
    rawDexieV1.close();

    // Now open via AuctionHistoryDatabase (which runs .version(2).upgrade(...))
    const upgradedDb = new AuctionHistoryDatabase(upgradeDbName);
    const upgradedAdapter = new IndexedDBAdapter(upgradedDb);

    const auctions = await upgradedAdapter.getAuctions(ANONYMOUS_USER_ID);
    expect(auctions).toHaveLength(1);
    expect(auctions[0].name).toBe('Legacy V1 Auction');
    expect(auctions[0].userId).toBe(ANONYMOUS_USER_ID);

    const participants = await upgradedAdapter.getParticipants(ANONYMOUS_USER_ID);
    expect(participants).toHaveLength(1);
    expect(participants[0].id).toBe('twitch:bob');
    expect(participants[0].userId).toBe(ANONYMOUS_USER_ID);
    expect(participants[0].syncKey).toBe(`${ANONYMOUS_USER_ID}:twitch:bob`);

    await upgradedDb.delete();
  });

  it('Scenario 8: Divergent Conflict Resolution with "remote" replaces local lots cleanly without zombies', async () => {
    // Local has lot-a1 and lot-a2
    const localLot2: AuctionHistoryLot = {
      id: 'lot-a2-local-only',
      userId: USER_101,
      auctionId: AUCTION_A_ID,
      name: 'Local Only Lot',
      totalAmount: 300,
      totalPoints: 300,
      totalDonationCents: 0,
    };
    const localSnapshotWith2Lots: AuctionHistorySnapshot = {
      ...snapshotA,
      auction: { ...auctionA, lotCount: 2, totalAmount: 1300 },
      lots: [lotA, localLot2],
    };
    await localAdapter.saveSnapshot(localSnapshotWith2Lots, USER_101);

    const localBefore = await localAdapter.getDetails(AUCTION_A_ID, USER_101);
    expect(localBefore?.lots).toHaveLength(2);

    // Remote has lot-a1 and lot-a3
    const remoteLot3: AuctionHistoryLot = {
      id: 'lot-a3-remote-only',
      userId: USER_101,
      auctionId: AUCTION_A_ID,
      name: 'Remote Only Lot',
      totalAmount: 500,
      totalPoints: 500,
      totalDonationCents: 0,
    };
    const remoteAuction: AuctionHistoryAuction = {
      ...auctionA,
      lotCount: 2,
      totalAmount: 1500,
    };

    vi.spyOn(backendApi, 'get').mockImplementation(async (url: string) => {
      if (url === '/api/auction-history') return { data: [remoteAuction] } as any;
      if (url === `/api/auction-history/${AUCTION_A_ID}`) {
        return {
          data: {
            auction: remoteAuction,
            lots: [lotA, remoteLot3],
            bids: snapshotA.bids,
            contributions: snapshotA.contributions,
            winnerEvents: snapshotA.winnerEvents,
          },
        } as any;
      }
      return { data: [] } as any;
    });

    let detectedConflict: AuctionSyncConflict | null = null;
    registerConflictHandler((c) => {
      detectedConflict = c;
    });
    vi.spyOn(backendApi, 'post').mockResolvedValue({ data: { success: true } } as any);

    await syncAuctionHistory(USER_101);
    expect(detectedConflict).not.toBeNull();

    // Streamer resolves choosing 'remote'
    await detectedConflict!.resolve('remote');

    // Local DB should now have ONLY remote lots (lotA and remoteLot3), NOT the old localLot2!
    const localAfter = await localAdapter.getDetails(AUCTION_A_ID, USER_101);
    expect(localAfter?.auction.totalAmount).toBe(1500);
    expect(localAfter?.lots).toHaveLength(2);
    const lotIds = localAfter?.lots.map((l) => l.id);
    expect(lotIds).toContain('lot-a1');
    expect(lotIds).toContain('lot-a3-remote-only');
    expect(lotIds).not.toContain('lot-a2-local-only');
  });

  it('Scenario 9: Dexie V3 to V4 Schema Upgrade migrates contributions to raw bids while preserving old contributions store', async () => {
    const upgradeDbName = `test-v3-upgrade-${Date.now()}-${Math.random()}`;
    const rawDexieV3 = new Dexie(upgradeDbName);
    rawDexieV3.version(1).stores({
      auctions: 'id, name, startedAt, endedAt, selectionMethod',
      lots: 'id, auctionId',
      participants: 'id, platformKey, displayName, wonLotCount, auctionCount',
      contributions:
        'id, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId]',
      winnerEvents: 'id, auctionId, lotId, status, createdAt, [auctionId+status]',
    });
    rawDexieV3.version(2).stores({
      auctions: 'id, userId, name, startedAt, endedAt, selectionMethod, [userId+startedAt]',
      lots: 'id, userId, auctionId, [userId+auctionId]',
      userParticipants: 'syncKey, id, userId, platformKey, displayName, wonLotCount, auctionCount',
      contributions:
        'id, userId, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId], [userId+auctionId]',
      winnerEvents: 'id, userId, auctionId, lotId, status, createdAt, [auctionId+status], [userId+auctionId]',
      syncQueue: 'id, userId, operation, entityType, entityId, createdAt',
    });
    rawDexieV3.version(3).stores({
      participants: null,
    });

    await rawDexieV3.open();
    await rawDexieV3.table('auctions').put({
      id: AUCTION_A_ID,
      userId: USER_101,
      name: 'Legacy V3 Auction',
      requestsKind: 'any',
      startedAt: '2026-09-01T10:00:00.000Z',
      endedAt: '2026-09-01T11:00:00.000Z',
      durationMs: 3600000,
      selectionMethod: 'wheel',
      pointsToDonationRatio: 1,
      lotCount: 1,
      participantCount: 1,
      totalAmount: 2000,
      totalPoints: 500,
      totalDonationCents: 1500,
      createdAt: '2026-09-01T11:00:00.000Z',
      schemaVersion: 1,
    });
    await rawDexieV3.table('contributions').put({
      id: `${AUCTION_A_ID}:lot-a1:twitch:bob`,
      userId: USER_101,
      auctionId: AUCTION_A_ID,
      lotId: 'lot-a1',
      participantId: 'twitch:bob',
      points: 500,
      donationCents: 1500,
      bidsCount: 2,
    });
    rawDexieV3.close();

    // Now open via AuctionHistoryDatabase (runs version 4 upgrade)
    const upgradedDb = new AuctionHistoryDatabase(upgradeDbName);
    const upgradedAdapter = new IndexedDBAdapter(upgradedDb);

    // 1. Verify old contributions store STILL exists and contains original record
    const oldContributions = await upgradedDb.contributions.toArray();
    expect(oldContributions).toHaveLength(1);
    expect(oldContributions[0].id).toBe(`${AUCTION_A_ID}:lot-a1:twitch:bob`);
    expect(oldContributions[0].points).toBe(500);
    expect(oldContributions[0].donationCents).toBe(1500);

    // 2. Verify new bids store contains the migrated raw bids
    const migratedBids = await upgradedDb.bids.toArray();
    expect(migratedBids).toHaveLength(2);

    const pointsBid = migratedBids.find((b) => b.kind === 'points');
    const moneyBid = migratedBids.find((b) => b.kind === 'money');

    expect(pointsBid).toBeDefined();
    expect(pointsBid?.amount_cents).toBe(500);
    expect(pointsBid?.currency).toBeNull();
    expect(pointsBid?.participantId).toBe('twitch:bob');

    expect(moneyBid).toBeDefined();
    expect(moneyBid?.amount_cents).toBe(1500);
    expect(moneyBid?.currency).toBe('RUB');
    expect(moneyBid?.participantId).toBe('twitch:bob');

    // 3. Verify getDetails returns both bids and contributions
    const details = await upgradedAdapter.getDetails(AUCTION_A_ID, USER_101);
    expect(details?.bids).toHaveLength(2);
    expect(details?.contributions).toHaveLength(1);

    await upgradedDb.delete();
  });

  it('Scenario 10: Raw Bids Ledger Persistence with Kind, Amount Cents, Currency, and Range Totals', async () => {
    const rawBidsAuctionId = 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
    const snapshotWithRawBids: AuctionHistorySnapshot = {
      auction: {
        id: rawBidsAuctionId,
        userId: USER_101,
        name: 'Raw Bids Auction',
        requestsKind: 'any',
        startedAt: '2026-10-22T10:00:00.000Z',
        endedAt: '2026-10-22T11:00:00.000Z',
        durationMs: 3600000,
        selectionMethod: 'direct',
        pointsToDonationRatio: 1,
        lotCount: 1,
        participantCount: 2,
        totalAmount: 2500,
        totalPoints: 1000,
        totalDonationCents: 1500,
        createdAt: '2026-10-22T11:00:00.000Z',
        schemaVersion: 2,
      },
      lots: [
        {
          id: 'lot-d1',
          userId: USER_101,
          auctionId: rawBidsAuctionId,
          name: 'Game D',
          totalAmount: 2500,
          totalPoints: 1000,
          totalDonationCents: 1500,
        },
      ],
      bids: [
        {
          id: 'bid-d1',
          userId: USER_101,
          auctionId: rawBidsAuctionId,
          lotId: 'lot-d1',
          participantId: 'twitch:bob',
          kind: 'points',
          amount_cents: 1000,
          amountCents: 1000,
          currency: null,
          createdAt: '2026-10-22T10:15:00.000Z',
        },
        {
          id: 'bid-d2',
          userId: USER_101,
          auctionId: rawBidsAuctionId,
          lotId: 'lot-d1',
          participantId: 'twitch:alice',
          kind: 'money',
          amount_cents: 1500,
          amountCents: 1500,
          currency: 'USD',
          createdAt: '2026-10-22T10:30:00.000Z',
        },
      ],
      participants: [
        {
          id: 'twitch:bob',
          userId: USER_101,
          displayName: 'Bob',
          platformKey: 'twitch',
          auctionCount: 1,
          wonLotCount: 1,
          bidCount: 1,
          totalPoints: 1000,
          totalDonationCents: 0,
          firstSeenAt: '2026-10-22T10:00:00.000Z',
          lastSeenAt: '2026-10-22T11:00:00.000Z',
        },
        {
          id: 'twitch:alice',
          userId: USER_101,
          displayName: 'Alice',
          platformKey: 'twitch',
          auctionCount: 1,
          wonLotCount: 0,
          bidCount: 1,
          totalPoints: 0,
          totalDonationCents: 1500,
          firstSeenAt: '2026-10-22T10:00:00.000Z',
          lastSeenAt: '2026-10-22T11:00:00.000Z',
        },
      ],
      winnerEvents: [
        {
          id: 'win-d1',
          userId: USER_101,
          auctionId: rawBidsAuctionId,
          lotId: 'lot-d1',
          method: 'direct',
          status: 'confirmed',
          createdAt: '2026-10-22T11:00:00.000Z',
        },
      ],
    };

    await localAdapter.saveSnapshot(snapshotWithRawBids, USER_101);

    // 1. Check raw bids store
    const bidsInDb = await db.bids.where('auctionId').equals(rawBidsAuctionId).toArray();
    expect(bidsInDb).toHaveLength(2);
    expect(bidsInDb.find((b) => b.kind === 'points')?.amount_cents).toBe(1000);
    expect(bidsInDb.find((b) => b.kind === 'money')?.currency).toBe('USD');

    // 2. Check getDetails returns raw bids
    const details = await localAdapter.getDetails(rawBidsAuctionId, USER_101);
    expect(details?.bids).toHaveLength(2);

    // 3. Check getRangeDetails returns raw bids
    const rangeDetails = await localAdapter.getRangeDetails(
      '2026-10-22T00:00:00.000Z',
      '2026-10-22T23:59:59.000Z',
      USER_101,
    );
    expect(rangeDetails.bids).toHaveLength(2);

    // 4. Verify no new writes to legacy contributions store
    const contribsInDb = await db.contributions.where('auctionId').equals(rawBidsAuctionId).toArray();
    expect(contribsInDb).toHaveLength(0);
  });

  it('Scenario 11: restoreFromLegacyContributions restores legacy backup store without data loss', async () => {
    const legacyAuctionId = 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee';
    await db.auctions.put({
      id: legacyAuctionId,
      userId: USER_101,
      name: 'Legacy Backup Auction',
      requestsKind: 'any',
      startedAt: '2026-10-15T10:00:00.000Z',
      endedAt: '2026-10-15T11:00:00.000Z',
      durationMs: 3600000,
      selectionMethod: 'direct',
      pointsToDonationRatio: 1,
      lotCount: 1,
      participantCount: 1,
      totalAmount: 3000,
      totalPoints: 1000,
      totalDonationCents: 2000,
      createdAt: '2026-10-15T11:00:00.000Z',
      schemaVersion: 1,
    });

    await db.contributions.put({
      id: 'contrib-legacy-1',
      userId: USER_101,
      auctionId: legacyAuctionId,
      lotId: 'lot-e1',
      participantId: 'twitch:charlie',
      points: 1000,
      donationCents: 2000,
      bidsCount: 2,
    });

    const restoredCount = await localAdapter.restoreFromLegacyContributions(USER_101);
    expect(restoredCount).toBe(2);

    const restoredBids = await db.bids.where('auctionId').equals(legacyAuctionId).toArray();
    expect(restoredBids).toHaveLength(2);
    expect(restoredBids.some((b) => b.kind === 'points' && b.amount_cents === 1000)).toBe(true);
    expect(restoredBids.some((b) => b.kind === 'money' && b.amount_cents === 2000 && b.currency === 'RUB')).toBe(true);
  });
});

