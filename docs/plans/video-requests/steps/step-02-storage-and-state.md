# Step 02: Storage And State

## Goal

Add Dexie-backed persistence and state hooks for video request queue data, settings, rejected requests, and watched/skipped history.

## Why This Step Exists

- Bid ingestion and UI need a single durable source of truth.
- Settings must persist independently from the current browser tab and survive reloads.

## Dependencies

- Requires: `step-01-route-and-domain-foundation`
- Unblocks: `step-04-bid-listening-and-request-ingestion`, `step-05-player-queue-and-utility-ui`, `step-06-settings-and-next-selection`, `step-07-twitch-chat-skip-voting`
- Can run in parallel with: `step-03-video-source-abstraction`

## Current-State Context

- Dexie is already used in `src/domains/auction/archive/api/IndexedDBAdapter.ts` and `src/shared/lib/database/userSettingsDb.ts`.
- Project rules require Dexie for IndexedDB operations.
- Existing settings patterns include React Query hooks and singleton repository adapters.

## Implementation Plan

1. Define model types in `src/domains/video-requests/model/types.ts`:
   - `VideoSourceId = 'youtube' | 'twitchClip' | 'twitchVod'`
   - `VideoRequestStatus = 'queued' | 'playing' | 'watched' | 'skipped' | 'removed'`
   - `VideoRequest`, `VideoMetadata`, `ParsedVideoReference`, `RejectedVideoRequest`, `VideoRequestSettings`, `SkipVoteState`.
2. Use `crypto.randomUUID()` for local request IDs and preserve the original bid ID separately.
3. Create default settings in `src/domains/video-requests/config/defaultSettings.ts`:
   - supported platforms: all three supported sources
   - autoplay: false
   - next strategy: request order
   - skip voting disabled
   - optional limits disabled by default
4. Create a Dexie database in `src/domains/video-requests/api/videoRequestsDb.ts` with tables:
   - `requests`: `id, status, createdAt, updatedAt, requestedBy, sourceId, bidId`
   - `settings`: `id`
   - `rejections`: `id, createdAt, requestedBy, bidId, source`
   - `history`: `id, status, completedAt, requestedBy, sourceId`
5. Create a repository in `src/domains/video-requests/api/VideoRequestsRepository.ts` exposing queue CRUD, settings get/save, rejection append/list/clear, and history append/list/clear.
6. Create React Query hooks in `src/domains/video-requests/model/hooks.ts` for loading/mutating queue, settings, rejections, and history.
7. Keep settings updates patch-based so settings modal can save individual groups without replacing unknown future fields.

## Files And Areas To Inspect

- `src/domains/auction/archive/api/IndexedDBAdapter.ts`
- `src/domains/winner-selection/wheel-of-random/lib/indexedDbSettingsStore.ts`
- `src/shared/lib/react-query/client.ts`
- `src/domains/video-requests/model`
- `src/domains/video-requests/api`

## Acceptance Criteria

- Queue, settings, rejected requests, and history can be created, read, updated, and cleared via repository methods.
- Settings load with defaults when no record exists.
- Repository methods do not throw for empty stores.
- All records include ISO timestamps where needed for ordering and display.

## Verification

- Run `pnpm run build`.
- Add focused unit tests for pure defaults/normalization helpers if they become non-trivial.
- Manually test repository methods through a temporary page/dev console only during implementation, then remove temporary code.

## Risks And Edge Cases

- Dexie schema upgrades must be additive and versioned if implementation changes table shape later.
- Queue ordering should use `createdAt` and stable insertion order, not array index stored only in React state.
- Avoid storing player runtime state in IndexedDB unless it is user-meaningful.

## Non-Goals

- Do not parse links or fetch metadata here.
- Do not connect integrations or Twitch chat here.
- Do not create UI beyond what is needed to prove hooks compile.
