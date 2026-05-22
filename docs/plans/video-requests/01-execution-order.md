# Execution Order

## Recommended Sequence

1. `step-01-route-and-domain-foundation`: Establish the root-level route and empty domain shell so later work has stable paths.
2. `step-02-storage-and-state`: Define durable Dexie persistence, request/settings types, and state hooks before ingestion or UI depends on them.
3. `step-03-video-source-abstraction`: Implement source contracts and providers before bids can be parsed into requests.
4. `step-04-bid-listening-and-request-ingestion`: Wire bid events into the new storage layer using the source providers and filters.
5. `step-05-player-queue-and-utility-ui`: Build the main page experience using the request state.
6. `step-06-settings-and-next-selection`: Add settings modal, filtering controls, and request selection strategies.
7. `step-07-twitch-chat-skip-voting`: Add browser chat integration and connect skip vote state to controls.
8. `step-08-final-integration-i18n-and-verification`: Merge final behavior, translations, metadata, and verification.

## Dependency Graph

- `step-01-route-and-domain-foundation` blocks all later steps.
- `step-02-storage-and-state` blocks: `step-04-bid-listening-and-request-ingestion`, `step-05-player-queue-and-utility-ui`, `step-06-settings-and-next-selection`, `step-07-twitch-chat-skip-voting`.
- `step-03-video-source-abstraction` blocks: `step-04-bid-listening-and-request-ingestion`, source-aware player rendering in `step-05-player-queue-and-utility-ui`.
- `step-04-bid-listening-and-request-ingestion` blocks full manual verification of steps 05-07.
- `step-05-player-queue-and-utility-ui`, `step-06-settings-and-next-selection`, and `step-07-twitch-chat-skip-voting` can run in parallel after steps 02-04 if they keep shared contracts stable.
- `step-08-final-integration-i18n-and-verification` depends on every previous step.

## Parallel Groups

### Group A: Experience Layers

- `step-05-player-queue-and-utility-ui`
- `step-06-settings-and-next-selection`
- `step-07-twitch-chat-skip-voting`
- Merge point: video request page container, shared request state hooks, utility bar controls, and settings modal.

## Checkpoints

- Checkpoint 1: `ROUTES.VIDEO_REQUESTS` renders an empty page outside `AppShell`.
- Checkpoint 2: Dexie repositories can read/write queue, settings, rejected history, and watched/skipped history.
- Checkpoint 3: a bid with a supported link creates a queued request and does not enter auction processing while the listener owns it.
- Checkpoint 4: player, queue, utility bar, settings, random picker, and skip voting all operate from the same persistent state.
- Checkpoint 5: `pnpm run build` passes and the route works after reload.

## Notes For Implementers

- Keep the route outside the `App` branch in `src/main.tsx`; adding it inside `AppMain` would violate the stream-scene requirement.
- Do not rely on sibling step files during implementation. Each step file repeats its local context intentionally.
- If ReactPlayer v3 does not handle Twitch clips/VODs reliably, use direct Twitch iframe embeds for Twitch providers while keeping the same `VideoSourceProvider` interface.
- If Twitch metadata cannot be fetched without backend help, store best-effort fallback metadata and keep the queue usable.
