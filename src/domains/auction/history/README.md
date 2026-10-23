# Auction History Frontend Architecture

## Overview

The Auction History domain provides historical tracking and visualization of completed auctions, lots, participant contributions, and winner selections.

To ensure seamless operation regardless of network connectivity, the frontend employs an **offline-first hybrid architecture**:
- **Local Persistence**: Dexie.js (IndexedDB `pointauc-auction-history`, Schema Version 2).
- **Remote Synchronization**: REST endpoints at `/api/auction-history` on `pointauc_backend`.

---

## 1. Adapter Architecture (`HybridAuctionHistoryAdapter`)

All UI hooks and business logic interact with `AuctionHistoryApi`:

```
                       ┌─────────────────────────┐
                       │   UI & Domain Logic     │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │    AuctionHistoryApi    │ (Abstract Base)
                       └────────────┬────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       ┌────────────────────────┐      ┌─────────────────────────┐
       │   IndexedDBAdapter     │      │HybridAuctionHistoryAdapter│
       │   (Local Dexie Store)  │◄─────┤ (Dual Storage & Sync)   │
       └────────────────────────┘      └────────────┬────────────┘
                                                    │
                                                    ▼
                                       ┌─────────────────────────┐
                                       │     pointauc_backend    │
                                       │   (/api/auction-history)│
                                       └─────────────────────────┘
```

### Operation Lifecycles
- **Reads**: Fast reads served locally from IndexedDB, ensuring zero latency on navigation.
- **Saves**: Saved to IndexedDB first, then uploaded to `POST /api/auction-history`. If offline or network errors occur, the snapshot is enqueued in the local `syncQueue` table.
- **Deletes**: Deleted from IndexedDB immediately, enqueued as a deletion tombstone in `syncQueue`, and sent via `DELETE /api/auction-history/:id` to backend.

---

## 2. Multi-User Scoping & Dexie Schema Versioning

### Dexie Schema Evolution (V1 -> V4)
The database schema (`pointauc-auction-history`) includes `userId` indexing and raw bids tracking:
- `auctions`: `'id, userId, name, startedAt, endedAt, selectionMethod, [userId+startedAt]'`
- `lots`: `'id, userId, auctionId, [userId+auctionId]'`
- `bids`: `'id, userId, auctionId, lotId, participantId, kind, [userId+auctionId], [auctionId+lotId], [auctionId+participantId], createdAt'`
- `userParticipants`: `'syncKey, id, userId, platformKey, displayName, wonLotCount, auctionCount'`
- `winnerEvents`: `'id, userId, auctionId, lotId, status, createdAt, [auctionId+status], [userId+auctionId]'`
- `syncQueue`: `'id, userId, operation, entityType, entityId, createdAt'`
- `contributions` *(Legacy Backup Store)*: `'id, userId, auctionId, lotId, participantId, [auctionId+participantId], [lotId+participantId], [auctionId+lotId], [userId+auctionId]'`

> [!NOTE]
> The `contributions` store is retained in Dexie V4 as a historical backup store. New snapshots write exclusively to `bids`. If needed, `indexedDBAdapter.restoreFromLegacyContributions(userId)` can re-populate raw bids from this backup store.

### User Context Resolution
- **Logged in**: `userId` is the string representation of `state.user.pointaucUserId` (or `state.user.userId`).
- **Logged out**: `userId` resolves to `last_active_user_id` stored in `localStorage`, or `'anonymous'`.
- **Multi-Account Switching**: When switching accounts, IndexedDB preserves data for each account separately without data contamination.

---

## 3. Synchronization Lifecycle (`syncService.ts`)

### Triggers
1. **Initial Mount**: Triggered on `AuctionHistoryPage` mount.
2. **User Authentication**: Triggered when the user transitions from unauthenticated to authenticated.
3. **Network Reconnection**: Triggered on `window.addEventListener('online')`.

### Step-by-Step Sync Algorithm
1. **Flush Deletions**: Deletion tombstones in `syncQueue` are sent to `DELETE /api/auction-history/:id`.
2. **Promote Anonymous Auctions**:
   - Searches for local auctions where `userId === 'anonymous'`.
   - Uploads them to `/api/auction-history` under the authenticated user.
   - Migrates local records to the active `userId`.
3. **Flush Pending Saves**: Pending local saves from `syncQueue` are sent to `POST /api/auction-history`.
4. **Bi-Directional Merge**:
   - Fetches remote auctions list via `GET /api/auction-history`.
   - Downloads remote-only auctions to local IndexedDB.
   - Uploads local-only auctions to backend.
   - Detects divergence on overlapping auctions and triggers conflict resolution.

---

## 4. Conflict Resolution & Auditing

When a local auction diverges from a cloud record with identical ID:
1. `AuctionHistoryConflictModal` displays a side-by-side comparison of local vs remote properties.
2. User chooses:
   - **Keep Local**: Local snapshot overwrites cloud version (`overwrite: true`).
   - **Keep Cloud**: Cloud version overwrites local IndexedDB record.
3. The client emits an analytics event (`auction_history_sync_conflict`).
4. The client logs the decision to `POST /api/auction-history/sync/conflict-log`.
