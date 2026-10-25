import { backendApi } from '@api/backendApi';

import { ANONYMOUS_USER_ID, getActiveUserId, isUserLoggedIn } from '../lib/userContext';
import { syncAuctionHistory } from '../lib/syncService';

import AuctionHistoryApi, { type AuctionHistoryDetails, type AuctionHistoryRangeDetails } from './AuctionHistoryApi';
import indexedDBAdapter, { IndexedDBAdapter } from './IndexedDBAdapter';

import type {
  AuctionHistoryAuction,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
} from '../model/types';

export class HybridAuctionHistoryAdapter extends AuctionHistoryApi {
  constructor(private localAdapter: IndexedDBAdapter = indexedDBAdapter) {
    super();
  }

  async getAuctions(userId = getActiveUserId()): Promise<AuctionHistoryAuction[]> {
    return this.localAdapter.getAuctions(userId);
  }

  async getAuctionsByDateRange(
    startAt: string,
    endAt: string,
    userId = getActiveUserId(),
  ): Promise<AuctionHistoryAuction[]> {
    return this.localAdapter.getAuctionsByDateRange(startAt, endAt, userId);
  }

  async getParticipants(userId = getActiveUserId()): Promise<AuctionHistoryParticipant[]> {
    return this.localAdapter.getParticipants(userId);
  }

  async getDetails(auctionId: string, userId = getActiveUserId()): Promise<AuctionHistoryDetails | null> {
    return this.localAdapter.getDetails(auctionId, userId);
  }

  async getRangeDetails(
    startAt: string,
    endAt: string,
    userId = getActiveUserId(),
  ): Promise<AuctionHistoryRangeDetails> {
    return this.localAdapter.getRangeDetails(startAt, endAt, userId);
  }

  async saveSnapshot(snapshot: AuctionHistorySnapshot, userId = getActiveUserId()): Promise<void> {
    // 1. Save locally in IndexedDB first
    await this.localAdapter.saveSnapshot(snapshot, userId);

    // 2. If logged in and online, attempt backend save; otherwise enqueue in syncQueue
    if (userId && userId !== ANONYMOUS_USER_ID) {
      if (isUserLoggedIn()) {
        try {
          await backendApi.post('/api/auction-history', { snapshot });
        } catch (err) {
          // Enqueue offline save
          await this.localAdapter.enqueueSync({
            userId,
            operation: 'save',
            entityType: 'auction',
            entityId: snapshot.auction.id,
            payload: snapshot,
          });
        }
      } else {
        // User logged out: queue save for when user logs back in
        await this.localAdapter.enqueueSync({
          userId,
          operation: 'save',
          entityType: 'auction',
          entityId: snapshot.auction.id,
          payload: snapshot,
        });
      }
    }
  }

  async deleteAuction(auctionId: string, userId = getActiveUserId()): Promise<void> {
    // 1. Delete locally from IndexedDB
    await this.localAdapter.deleteAuction(auctionId, userId);

    // 2. Enqueue deletion tombstone
    let queueId: string | null = null;
    if (userId && userId !== ANONYMOUS_USER_ID) {
      queueId = await this.localAdapter.enqueueSync({
        userId,
        operation: 'delete',
        entityType: 'auction',
        entityId: auctionId,
      });

      // 3. Attempt immediate remote deletion only if logged in
      if (isUserLoggedIn()) {
        try {
          await backendApi.delete(`/api/auction-history/${auctionId}`);
          if (queueId) {
            await this.localAdapter.removeSyncItem(queueId);
          }
        } catch (err) {
          // Retain tombstone in syncQueue to flush upon reconnection
        }
      }
    }
  }

  async getNextDefaultName(language?: string, userId = getActiveUserId()): Promise<string> {
    return this.localAdapter.getNextDefaultName(language, userId);
  }

  async sync(userId = getActiveUserId()): Promise<void> {
    await syncAuctionHistory(userId);
  }
}

const hybridAuctionHistoryAdapter = new HybridAuctionHistoryAdapter();
export default hybridAuctionHistoryAdapter;
