# Video Requests

## Goal

Build a new root-level video requests page for streamers to show on stream. Viewers request videos by sending existing bid events with supported video links, and the page lets the streamer review the queue, play videos, manage playback, tune filters, and handle skip voting.

## Success Outcome

- The page is available outside the existing `AppShell` so it can be used cleanly as a stream scene.
- When listening is enabled, selected bid integrations create video requests instead of normal auction actions.
- The queue, settings, rejected requests, and watched/skipped history persist in browser IndexedDB.
- YouTube videos, Twitch clips, and Twitch VODs work through one shared source contract.
- Skip voting listens to Twitch chat from the browser with an anonymous read-only connection.

## Current State

- Root routing is configured in `src/main.tsx`; the existing app shell is mounted under `{ path: `${ROUTES.HOME}*`, element: <App /> }`.
- `ROUTES.VIDEO_REQUESTS` already exists as `/videoPoints`, but no page is currently wired to it.
- Bid integrations expose `pubsubFlow.events` and all bids are forwarded into `globalBidsEventBus` in `src/App/entrypoint/App.tsx`.
- Auction processing subscribes to `globalBidsEventBus` globally and dispatches `processRedemption`.
- Dexie is already used for auction archive and wheel settings.
- Wheel UI is available from `@domains/winner-selection/wheel-of-random/ui/FullWheelUI`.

## Target Shape

- Add a `src/domains/video-requests` slice with `api`, `model`, `ui`, `lib`, and `config` areas.
- Add a root-router route for `ROUTES.VIDEO_REQUESTS` that renders without `AppShell`, navbar, auction background, or auction autosave UI.
- Introduce video request storage and state hooks backed by Dexie.
- Introduce source providers for YouTube, Twitch clips, and Twitch VODs. Components receive normalized `VideoRequest` records and do not branch on source-specific parsing or player details.
- Introduce a page-level request listener that subscribes to `globalBidsEventBus` only when enabled and consumes matched bids for video requests.

## Shared Constraints

- Use Tailwind CSS for all new styling and Mantine for base UI components.
- Use translations for all user-visible text. Add keys to `src/assets/i18n/locales/en.json` first and matching stubs to `src/assets/i18n/locales/ru.json`.
- Use absolute project aliases for imports.
- Keep new files focused; split files under 300 lines when it improves clarity.
- Do not add barrel exports.
- Do not auto-refund or auto-return channel point redemptions in v1.

## Architecture Notes

- Bid routing must avoid double handling. When video request listening is active for a selected source group, those bids should create video requests and skip normal auction processing.
- The source abstraction owns parsing, metadata loading, and player URL construction. UI owns layout and common controls.
- Store metadata snapshots on each request so existing queue cards remain stable if later metadata fetches fail.
- The default chat channel for skip voting is the logged-in Twitch username.
- Twitch embed URLs must include the current browser host as the `parent` parameter.

## Risks

- Existing global bid processing currently runs in `App`, so root-level video request routes need a shared routing/consumption mechanism that works even outside `AppShell`.
- Twitch metadata may require an authenticated Helix request; if no suitable token path is available, implement graceful fallback metadata from parsed URLs and embed previews.
- Browser autoplay can be restricted until the streamer interacts with the page. The UI should surface player errors and allow manual start.
- Twitch embeds and clips can fail if `parent` is wrong or if content is unavailable.

## Shared Definitions

- `VideoRequest`: a normalized requested video record created from a bid.
- `VideoSourceProvider`: a source-specific adapter for parsing links, loading metadata, and rendering/building player URLs.
- `RejectedRequest`: a bid that could not become a queued video because no supported link was found or settings filters rejected it.
- `Listening`: the page-level state where selected integrations are connected and incoming bid events are interpreted as video request attempts.
- `Theater mode`: a fullscreen-like mode where the player occupies the viewport and queue/controls slide in from the right on pointer proximity.
