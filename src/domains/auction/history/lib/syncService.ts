import { backendApi } from '@api/backendApi';
import { trackAuctionHistorySyncConflict } from '@shared/lib/analytics/events/auctionHistory';
import { store } from '@store';

import indexedDBAdapter from '../api/IndexedDBAdapter';

import { ANONYMOUS_USER_ID, getActiveUserId } from './userContext';

import type { AuctionHistoryDetails } from '../api/AuctionHistoryApi';
import type {
  AuctionHistoryAuction,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
} from '../model/types';

export type ConflictResolutionChoice = 'local' | 'remote';

export interface AuctionSyncConflict {
  auctionId: string;
  localAuction: AuctionHistoryAuction;
  remoteAuction: AuctionHistoryAuction;
  localDetails: AuctionHistoryDetails | null;
  remoteDetails: AuctionHistoryDetails | null;
  resolve: (choice: ConflictResolutionChoice) => Promise<void>;
}

export type ConflictHandler = (conflict: AuctionSyncConflict) => void;

let activeConflictHandler: ConflictHandler | null = null;
const pendingConflicts: AuctionSyncConflict[] = [];

export const registerConflictHandler = (handler: ConflictHandler | null): (() => void) => {
  activeConflictHandler = handler;

  if (handler && pendingConflicts.length > 0) {
    const nextConflict = pendingConflicts.shift();
    if (nextConflict) {
      handler(nextConflict);
    }
  }

  return () => {
    if (activeConflictHandler === handler) {
      activeConflictHandler = null;
    }
  };
};

export const buildSnapshotFromDetails = (
  details: AuctionHistoryDetails,
  targetUserId: string,
  userParticipantsMap: Map<string, AuctionHistoryParticipant> = new Map(),
): AuctionHistorySnapshot => {
  const confirmedWinnerLotIds = new Set(
    details.winnerEvents.filter((event) => event.status === 'confirmed').map((event) => event.lotId),
  );

  const contribByParticipant = new Map<
    string,
    { bidCount: number; points: number; donationCents: number; wonLotIds: Set<string> }
  >();

  const effectiveBids =
    details.bids && details.bids.length > 0
      ? details.bids
      : (details.contributions
          ? indexedDBAdapter.deriveBidsFromContributions(details.contributions, details.auction.endedAt)
          : []);

  if (effectiveBids.length > 0) {
    effectiveBids.forEach((b) => {
      const acc = contribByParticipant.get(b.participantId) ?? {
        bidCount: 0,
        points: 0,
        donationCents: 0,
        wonLotIds: new Set<string>(),
      };
      acc.bidCount += 1;
      const amt = Number(b.amount_cents ?? b.amountCents ?? 0);
      if (b.kind === 'points') {
        acc.points += amt;
      } else {
        acc.donationCents += amt;
      }
      if (confirmedWinnerLotIds.has(b.lotId)) {
        acc.wonLotIds.add(b.lotId);
      }
      contribByParticipant.set(b.participantId, acc);
    });
  } else if (details.contributions) {
    details.contributions.forEach((c) => {
      const acc = contribByParticipant.get(c.participantId) ?? {
        bidCount: 0,
        points: 0,
        donationCents: 0,
        wonLotIds: new Set<string>(),
      };
      acc.bidCount += c.bidsCount;
      acc.points += c.points;
      acc.donationCents += c.donationCents;
      if (confirmedWinnerLotIds.has(c.lotId)) {
        acc.wonLotIds.add(c.lotId);
      }
      contribByParticipant.set(c.participantId, acc);
    });
  }

  const participants: AuctionHistoryParticipant[] = Array.from(contribByParticipant.entries()).map(
    ([pId, stats]) => {
      const existing = userParticipantsMap.get(pId);
      const platformKey = (existing?.platformKey ?? (pId.includes(':') ? pId.split(':')[0] : 'unknown')) as any;
      const displayName = existing?.displayName ?? (pId.includes(':') ? pId.split(':')[1] : 'Anonymous');

      return {
        id: pId,
        syncKey: `${targetUserId}:${pId}`,
        userId: targetUserId,
        displayName,
        platformKey,
        auctionCount: 1,
        wonLotCount: stats.wonLotIds.size,
        bidCount: stats.bidCount,
        totalPoints: stats.points,
        totalDonationCents: stats.donationCents,
        firstSeenAt: details.auction.startedAt,
        lastSeenAt: details.auction.endedAt,
      };
    },
  );

  return {
    auction: { ...details.auction, userId: targetUserId },
    lots: details.lots.map((l) => ({ ...l, userId: targetUserId })),
    bids: effectiveBids.map((b) => ({ ...b, userId: targetUserId })),
    winnerEvents: details.winnerEvents.map((w) => ({ ...w, userId: targetUserId })),
    participants,
  };
};

export const resolveConflict = async ({
  userId,
  auctionId,
  choice,
  localDetails,
  remoteDetails,
}: {
  userId: string;
  auctionId: string;
  choice: ConflictResolutionChoice;
  localDetails: AuctionHistoryDetails | null;
  remoteDetails: AuctionHistoryDetails | null;
}): Promise<void> => {
  if (choice === 'local' && localDetails) {
    const userParticipants = await indexedDBAdapter.getParticipants(userId);
    const userParticipantsMap = new Map(userParticipants.map((p) => [p.id, p]));
    const snapshot = buildSnapshotFromDetails(localDetails, userId, userParticipantsMap);

    await backendApi.post('/api/auction-history', { snapshot, overwrite: true });
  } else if (choice === 'remote' && remoteDetails) {
    await indexedDBAdapter.saveSnapshot(
      {
        auction: remoteDetails.auction,
        lots: remoteDetails.lots,
        bids: remoteDetails.bids ?? [],
        contributions: remoteDetails.contributions,
        winnerEvents: remoteDetails.winnerEvents,
        participants: [],
      },
      userId,
    );
  }

  // Structured backend logging
  try {
    await backendApi.post('/api/auction-history/sync/conflict-log', {
      auctionId,
      resolution: choice,
      localDetails,
      remoteDetails,
    });
  } catch (err) {
    console.error('Failed to log sync conflict to server:', err);
  }

  // Analytics event tracking
  try {
    trackAuctionHistorySyncConflict({
      auctionId,
      resolution: choice,
      localTotalAmount: localDetails?.auction.totalAmount,
      remoteTotalAmount: remoteDetails?.auction.totalAmount,
    });
  } catch (err) {
    console.error('Failed to track sync conflict analytics:', err);
  }
};

export interface SyncResult {
  status: 'synced' | 'offline' | 'skipped_anonymous';
  uploadedCount?: number;
  downloadedCount?: number;
  promotedCount?: number;
  conflictsCount?: number;
}

export const syncAuctionHistory = async (userId = getActiveUserId()): Promise<SyncResult> => {
  if (!userId || userId === ANONYMOUS_USER_ID) {
    return { status: 'skipped_anonymous' };
  }

  let uploadedCount = 0;
  let downloadedCount = 0;
  let promotedCount = 0;
  let conflictsCount = 0;

  // 1. Flush offline delete tombstones from syncQueue
  try {
    const pendingDeletes = await indexedDBAdapter.db.syncQueue
      .where('userId')
      .equals(userId)
      .filter((item) => item.operation === 'delete')
      .toArray();

    for (const item of pendingDeletes) {
      try {
        await backendApi.delete(`/api/auction-history/${item.entityId}`);
        await indexedDBAdapter.removeSyncItem(item.id);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await indexedDBAdapter.removeSyncItem(item.id);
        } else {
          console.error('Failed to flush delete tombstone:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error querying delete tombstones:', err);
  }

  // 2. Anonymous auctions promotion
  try {
    const anonAuctions = await indexedDBAdapter.getAnonymousAuctions();
    const anonParticipants = await indexedDBAdapter.getParticipants(ANONYMOUS_USER_ID);
    const anonParticipantsMap = new Map(anonParticipants.map((p) => [p.id, p]));

    for (const anon of anonAuctions) {
      const details = await indexedDBAdapter.getDetails(anon.id, ANONYMOUS_USER_ID);
      if (details) {
        const snapshot = buildSnapshotFromDetails(details, userId, anonParticipantsMap);
        try {
          await backendApi.post('/api/auction-history', { snapshot });
          promotedCount += 1;
        } catch (err) {
          console.error('Failed to upload promoted anonymous auction to backend:', err);
          await indexedDBAdapter.enqueueSync({
            userId,
            operation: 'save',
            entityType: 'auction',
            entityId: anon.id,
            payload: snapshot,
          });
        }

        await indexedDBAdapter.promoteAnonymousAuction(anon.id, userId);
      }
    }
  } catch (err) {
    console.error('Error promoting anonymous auctions:', err);
  }

  // 3. Flush pending local saves from syncQueue
  try {
    const pendingSaves = await indexedDBAdapter.db.syncQueue
      .where('userId')
      .equals(userId)
      .filter((item) => item.operation === 'save')
      .toArray();

    for (const item of pendingSaves) {
      try {
        if (item.payload) {
          await backendApi.post('/api/auction-history', { snapshot: item.payload, overwrite: true });
          uploadedCount += 1;
        }
        await indexedDBAdapter.removeSyncItem(item.id);
      } catch (err) {
        console.error('Failed to flush offline save to backend:', err);
      }
    }
  } catch (err) {
    console.error('Error flushing pending saves:', err);
  }

  // 4. Remote Sync: Fetch user auctions from server
  let remoteAuctions: AuctionHistoryAuction[] = [];
  try {
    const res = await backendApi.get<AuctionHistoryAuction[]>('/api/auction-history');
    remoteAuctions = res.data;
  } catch (err) {
    return { status: 'offline', uploadedCount, promotedCount };
  }

  const localAuctions = await indexedDBAdapter.getAuctions(userId);
  const localMap = new Map(localAuctions.map((a) => [a.id, a]));
  const remoteMap = new Map(remoteAuctions.map((a) => [a.id, a]));

  // 4a. Remote-only auctions: download them into local IndexedDB
  for (const remote of remoteAuctions) {
    if (!localMap.has(remote.id)) {
      try {
        const detailsRes = await backendApi.get<AuctionHistoryDetails>(`/api/auction-history/${remote.id}`);
        const details = detailsRes.data;
        if (details) {
          await indexedDBAdapter.saveSnapshot(
            {
              auction: details.auction,
              lots: details.lots,
              bids: details.bids ?? [],
              contributions: details.contributions,
              winnerEvents: details.winnerEvents,
              participants: [],
            },
            userId,
          );
          downloadedCount += 1;
        }
      } catch (err) {
        console.error(`Failed to download remote auction ${remote.id}:`, err);
      }
    }
  }

  // Sync aggregated participants
  try {
    const participantsRes = await backendApi.get<AuctionHistoryParticipant[]>('/api/auction-history/participants');
    const remoteParticipants = participantsRes.data;
    if (remoteParticipants.length > 0) {
      await indexedDBAdapter.db.participants.bulkPut(
        remoteParticipants.map((p) => ({ ...p, syncKey: `${userId}:${p.id}`, userId })),
      );
    }
  } catch (err) {
    console.error('Failed to sync remote participants:', err);
  }

  // 4b. Local-only auctions: upload to server
  const userParticipants = await indexedDBAdapter.getParticipants(userId);
  const userParticipantsMap = new Map(userParticipants.map((p) => [p.id, p]));

  for (const local of localAuctions) {
    if (!remoteMap.has(local.id)) {
      const details = await indexedDBAdapter.getDetails(local.id, userId);
      if (details) {
        try {
          const snapshot = buildSnapshotFromDetails(details, userId, userParticipantsMap);
          await backendApi.post('/api/auction-history', { snapshot });
          uploadedCount += 1;
        } catch (err) {
          console.error(`Failed to upload local-only auction ${local.id}:`, err);
        }
      }
    }
  }

  // 4c. Overlapping auctions: conflict check
  for (const local of localAuctions) {
    const remote = remoteMap.get(local.id);
    if (remote) {
      const isDivergent =
        local.totalAmount !== remote.totalAmount ||
        local.lotCount !== remote.lotCount ||
        local.totalPoints !== remote.totalPoints;

      if (isDivergent) {
        conflictsCount += 1;
        const [localDetails, remoteDetailsRes] = await Promise.all([
          indexedDBAdapter.getDetails(local.id, userId),
          backendApi.get<AuctionHistoryDetails>(`/api/auction-history/${remote.id}`).catch(() => null),
        ]);
        const remoteDetails = remoteDetailsRes ? remoteDetailsRes.data : null;

        const conflict: AuctionSyncConflict = {
          auctionId: local.id,
          localAuction: local,
          remoteAuction: remote,
          localDetails,
          remoteDetails,
          resolve: async (choice: ConflictResolutionChoice) => {
            await resolveConflict({
              userId,
              auctionId: local.id,
              choice,
              localDetails,
              remoteDetails,
            });
          },
        };

        if (activeConflictHandler) {
          activeConflictHandler(conflict);
        } else {
          pendingConflicts.push(conflict);
        }
      }
    }
  }

  return {
    status: 'synced',
    uploadedCount,
    downloadedCount,
    promotedCount,
    conflictsCount,
  };
};

export const initSyncListeners = (): (() => void) => {
  const handleOnline = () => {
    syncAuctionHistory().catch((err) => console.error('Auto sync on online error:', err));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
  }

  let previousUserId: string | null = null;
  const unsubscribeStore = store.subscribe(() => {
    try {
      const state = store.getState();
      const currentUserId = state.user?.pointaucUserId ?? state.user?.userId;
      const currentStringId = currentUserId ? String(currentUserId) : null;

      if (currentStringId && currentStringId !== previousUserId) {
        previousUserId = currentStringId;
        syncAuctionHistory(currentStringId).catch((err) => console.error('Auto sync on login error:', err));
      } else if (!currentStringId) {
        previousUserId = null;
      }
    } catch {
      // ignore
    }
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
    }
    unsubscribeStore();
  };
};
