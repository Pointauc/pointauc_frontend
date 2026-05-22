# Step 04: Bid Listening And Request Ingestion

## Goal

Connect selected bid integrations to video request creation while preventing those bids from also being processed by the auction when video listening owns them.

## Why This Step Exists

- Viewers request videos through existing bid events.
- The feature needs page-level controls for donations and channel points without duplicating integration implementations.

## Dependencies

- Requires: `step-02-storage-and-state`, `step-03-video-source-abstraction`
- Unblocks: complete behavior for UI, settings, and skip voting steps
- Can run in parallel with: none

## Current-State Context

- `src/App/entrypoint/App.tsx` forwards all `integration.pubsubFlow.events` into `globalBidsEventBus`.
- The same file globally subscribes to `globalBidsEventBus` and dispatches `processRedemption`.
- `integrations` are grouped into `donate` and `points` in `src/domains/bids/external-integrations/integrations.ts`.
- `SwitchAllIntegrations` shows how existing UI connects/disconnects integration pubsub flows.

## Implementation Plan

1. Introduce a bid consumption contract in `src/domains/bids/lib/globalBidsEventBus.ts` or a nearby helper:
   - Consumers can register a handler that returns `true` when it handled a bid.
   - Auction processing runs only when no active consumer handled the bid.
2. Move the auction `processRedemption` subscription out of `App` into a shared handler that honors the consumption result. Keep existing auction behavior unchanged when no video request consumer is active.
3. In `src/domains/video-requests/model/useVideoRequestListener.ts`, subscribe to `globalBidsEventBus` only while page listening is enabled.
4. Settings/control state selects which integration groups are active:
   - donations
   - channel points
5. When listening starts, call `pubsubFlow.connect()` only for selected and authenticated integrations. When listening stops, disconnect the integrations that were started by this page unless they were already connected before the page toggled them.
6. On each consumed bid:
   - Ignore bid sources outside selected groups.
   - Parse the bid message through the source registry.
   - If no provider matches, append a rejected request with reason `unsupported_source`.
   - Load metadata with fallback.
   - Validate against current settings.
   - Enqueue valid requests.
   - Append rejected requests for filter failures.
7. Preserve original bid data on each request: bid ID, source, cost, requester username, message, timestamp, reward ID, and donation flag.

## Files And Areas To Inspect

- `src/App/entrypoint/App.tsx`
- `src/domains/bids/lib/globalBidsEventBus.ts`
- `src/domains/bids/external-integrations/integrations.ts`
- `src/components/SwitchAllIntegrations/SwitchAllIntegrations.tsx`
- `src/reducers/Purchases/Purchases.ts`
- `src/domains/video-requests/model`

## Acceptance Criteria

- With video request listening off, all bids follow existing auction behavior.
- With video request listening on and source group selected, matching bids create video requests and do not enter auction processing.
- Invalid or filtered bid messages produce rejected history records, not auction items.
- The listener cleans up subscriptions on route unmount.
- Integration loading/subscribed state is visible to the video request controls.

## Verification

- Run `pnpm run build`.
- Use existing mock bid tooling or a temporary local event trigger during implementation, then remove temporary code.
- Manually verify one donation-source bid and one points-source bid route according to selected listener controls.

## Risks And Edge Cases

- Some integrations may already be connected for the auction. Track page-owned connections to avoid disconnecting a service the user had active elsewhere.
- If metadata loading is slow, the UI should show pending queue state rather than blocking the whole listener.
- If a bid has multiple supported links, choose the first supported link in message order for v1.

## Non-Goals

- Do not return rejected channel point redemptions.
- Do not add backend changes.
- Do not process chat messages as video requests; chat is only for skip voting in v1.
