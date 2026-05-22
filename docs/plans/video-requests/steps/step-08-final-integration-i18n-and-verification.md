# Step 08: Final Integration, I18n, And Verification

## Goal

Finish integration across the route, state, source providers, listener, UI, settings, and skip voting; add translations and verify the full feature.

## Why This Step Exists

- Parallel steps converge on shared page controls and state.
- The final pass catches route, persistence, translation, and playback issues that only appear end-to-end.

## Dependencies

- Requires: steps 01-07
- Unblocks: release readiness
- Can run in parallel with: none

## Current-State Context

- `en.json` is the primary translation file.
- `ru.json` should receive matching stubs for new keys in the same change.
- The project build command is `pnpm run build`.
- The route must remain outside the app shell after all UI is connected.

## Implementation Plan

1. Review every new user-visible string and move it under a `videoRequests` translation namespace.
2. Add metadata for `/videoPoints` if the metadata component/root metadata supports route-specific entries.
3. Ensure the page works with:
   - no queue
   - loading metadata
   - metadata fallback
   - queue with one item
   - queue with multiple items
   - theater mode
   - random wheel mode
   - skip voting enabled and disabled
4. Confirm bid consumption:
   - listener off: auction processing still works
   - listener on: selected integration groups create video requests only
   - unselected source groups still follow normal auction behavior if that is how the final consumption policy is implemented
5. Confirm persistence:
   - queue survives reload
   - settings survive reload
   - rejected history survives reload
   - watched/skipped history survives reload
6. Finalize visual polish:
   - no nested cards
   - no text overlap
   - compact controls use icons where appropriate
   - cards remain stable when metadata is missing or long
7. Remove temporary debugging hooks, console logs, and development-only triggers.

## Files And Areas To Inspect

- `src/domains/video-requests`
- `src/main.tsx`
- `src/models/integration.ts`
- `src/domains/bids/lib/globalBidsEventBus.ts`
- `src/assets/i18n/locales/en.json`
- `src/assets/i18n/locales/ru.json`

## Acceptance Criteria

- `pnpm run build` passes.
- `/videoPoints` is usable outside `AppShell`.
- All visible text is translated.
- Queue and settings persistence works after hard reload.
- YouTube and Twitch providers handle valid links and fail gracefully.
- Theater mode, history modal, settings modal, listener controls, autoplay, and skip voting all work together.

## Verification

- Run `pnpm run build`.
- Optional: run `pnpm run lint` if the touched files are expected to satisfy current lint rules.
- Manual scenarios:
  - Open `/videoPoints` directly.
  - Toggle listening for donation and channel-point groups.
  - Emit or receive valid YouTube, Twitch clip, and Twitch VOD bid messages.
  - Emit an invalid bid message and verify rejected history.
  - Remove one queue item and clear the whole queue.
  - Play a video to completion with autoplay off and on.
  - Use previous/next controls and inspect tooltip cards.
  - Open history and settings modals.
  - Switch to random wheel mode and pick next.
  - Enable skip voting, send skip command from enough unique chat users, and verify auto-skip.
  - Enter and exit theater mode.

## Risks And Edge Cases

- The app has old and new architecture side by side. Keep new code in the video requests domain and only touch shared integration seams where necessary.
- Some locale files may contain legacy encoding issues. Preserve file encoding and add keys carefully.
- Build may expose unrelated type issues; separate unrelated failures from feature failures in the final report.

## Non-Goals

- Do not add moderation tooling, duplicate merging, manual search/add, export/import, or refund automation in this final pass.
- Do not add new backend APIs unless an earlier step found Twitch metadata impossible without them and the product owner approved that expansion.
