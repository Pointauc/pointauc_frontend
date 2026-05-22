# Step 06: Settings And Next Selection

## Goal

Implement the settings modal, request filters, autoplay behavior, and next-video selection strategies including weighted random wheel picking.

## Why This Step Exists

- Streamers need guardrails for accepted requests.
- The selected next strategy changes both queue behavior and utility bar controls.

## Dependencies

- Requires: `step-02-storage-and-state`
- Works best after: `step-05-player-queue-and-utility-ui`
- Can run in parallel with: `step-07-twitch-chat-skip-voting`

## Current-State Context

- Mantine v8 `TagsInput` supports controlled `value: string[]`, `onChange`, `data`, and controlled search via `searchValue`/`onSearchChange`.
- The project uses Mantine and React Hook Form in several areas, but simple local form state is acceptable for this scoped settings modal.
- `RandomWheel` can receive custom `items`, a ref, and `onWin`.

## Implementation Plan

1. Build `VideoRequestSettingsModal` with translated sections:
   - filters
   - next selection
   - skip voting settings
2. Filters:
   - Supported platforms: Mantine `TagsInput` with autocomplete data for YouTube, Twitch clips, Twitch VODs, plus helper buttons for select all and deselect all.
   - Max length: numeric input in minutes or seconds, with clear unit labeling.
   - Max videos from one person at the same time: switch plus numeric input.
   - Min views: numeric input.
   - Max total videos: switch plus numeric input.
   - Max total length: switch plus numeric input.
3. Next selection strategy:
   - Store as `requestOrder`, `biggestBid`, or `randomWheel`.
   - Use a concise UI label such as "Next pick".
   - `requestOrder`: next queued item by created time.
   - `biggestBid`: highest bid cost, tie broken by created time.
   - `randomWheel`: utility bar button text changes from Next to Pick Next.
4. Random wheel flow:
   - Convert queued requests to `WheelItem[]` with `amount` equal to bid cost, or `1` when cost is missing/zero.
   - On Pick Next, replace the player area with the wheel view, wait a tiny delay, spin immediately, then set the winning request as current.
   - If autoplay is enabled and current video ends, show and spin the wheel automatically.
5. Autoplay:
   - When enabled, ending a video selects and starts the next request according to current strategy.
   - When disabled, ending a video marks it watched/skipped as appropriate and waits for manual action.
6. Apply filters during ingestion and when settings change:
   - New requests are rejected if they violate current filters.
   - Existing queue items are not automatically removed when settings become stricter; show a non-blocking warning or leave cleanup to manual controls.

## Files And Areas To Inspect

- `src/domains/video-requests/ui/Settings`
- `src/domains/video-requests/model/types.ts`
- `src/domains/video-requests/model/hooks.ts`
- `src/domains/winner-selection/wheel-of-random/ui/FullWheelUI/index.tsx`
- `src/models/wheel.model.ts`

## Acceptance Criteria

- Settings persist to IndexedDB and reload correctly.
- Supported platform tags can be searched, selected, selected all, and deselected all.
- Disabled limit inputs are visually disabled and ignored by validation.
- Next button becomes Pick Next in random wheel mode.
- Random wheel segments are weighted by bid size.
- Autoplay advances according to the active strategy.

## Verification

- Run `pnpm run build`.
- Manually verify each filter rejects new requests as expected.
- Manually verify next selection tie-breaking for request order and biggest bid.
- Manually verify random wheel mode with at least three queued requests with different bid sizes.

## Risks And Edge Cases

- Wheel settings include advanced randomness options that may be too much for this feature. Use default wheel settings and hide unnecessary settings controls.
- A queue can become empty between Pick Next click and wheel spin. Handle this by returning to empty state.
- If every bid cost is zero, use equal weights.

## Non-Goals

- Do not add refund behavior for rejected requests.
- Do not persist every transient wheel animation state.
