# Step 05: Player, Queue, And Utility UI

## Goal

Build the main video requests page layout: large player, right queue, bottom utility bar, empty-state controls, history modal, and theater mode.

## Why This Step Exists

- This is the core streamer-facing experience.
- The page should be usable on stream and ergonomic for repeated queue control.

## Dependencies

- Requires: `step-02-storage-and-state`, `step-03-video-source-abstraction`
- Works best after: `step-04-bid-listening-and-request-ingestion`
- Can run in parallel with: `step-06-settings-and-next-selection`, `step-07-twitch-chat-skip-voting`

## Current-State Context

- Mantine is available for `Modal`, `Tooltip`, `Switch`, `Button`, `ActionIcon`, `Checkbox`, `Card`, and layout primitives.
- `@tabler/icons-react` is installed and used elsewhere for icon buttons.
- New styling must use Tailwind classes, not CSS modules.
- Queue cards should resemble compact YouTube cards, with preview image, name, views, likes percentage, length, channel, age, and remove action.

## Implementation Plan

1. Create page composition components under `src/domains/video-requests/ui`:
   - `Page/VideoRequestsPage.tsx`
   - `Player/VideoRequestPlayer.tsx`
   - `Queue/VideoRequestQueue.tsx`
   - `Queue/VideoRequestCard.tsx`
   - `Controls/VideoRequestsUtilityBar.tsx`
   - `Controls/IntegrationListenerControls.tsx`
   - `History/VideoRequestHistoryModal.tsx`
   - `Settings/VideoRequestSettingsModal.tsx` placeholder if step 06 has not completed.
2. Layout normal mode as:
   - player area: flexible main region
   - queue sidebar: fixed responsive width on the right
   - utility bar: bottom band with current title, metadata, autoplay, previous/next, history, settings, theater controls.
3. Empty player state:
   - translated empty queue message
   - listener toggle
   - integration checkbox cards shown inline, not tooltip-based.
4. Queue header:
   - listener toggle
   - hover tooltip opening left with donation and channel-point checkbox cards.
5. Queue body:
   - render queued video cards
   - remove button per card
   - bottom clear queue button with confirmation if the queue is non-empty.
6. Player rendering:
   - Use source provider `buildPlayerUrl`.
   - Prefer `ReactPlayer` for YouTube if it works reliably; use iframe fallback for Twitch embeds.
   - Wire `onEnded` to autoplay/next-selection behavior.
   - Show translated loading/error states.
7. Utility controls:
   - previous and next buttons show tooltips containing compact cards for the target request.
   - history button opens skipped/watched history modal.
   - settings button opens settings modal.
   - theater button toggles theater mode.
8. Theater mode:
   - Player fills the viewport.
   - Right edge hover or focus reveals a sliding panel.
   - Sliding panel uses semi-transparent blurred background.
   - Panel top contains utility controls; panel bottom contains queue cards.

## Files And Areas To Inspect

- `src/domains/video-requests/ui`
- `src/shared/mantine/ui`
- `src/shared/ui/HotkeyTooltip`
- `src/assets/i18n/locales/en.json`
- `src/assets/i18n/locales/ru.json`

## Acceptance Criteria

- The page has the three requested regions in normal mode.
- Queue cards display all available metadata and gracefully hide unknown values.
- Empty state exposes listener controls without a tooltip.
- Previous/next tooltips preview target videos.
- History modal shows skipped/watched cards.
- Theater mode maximizes the player and reveals controls/queue from the right.

## Verification

- Run `pnpm run build`.
- Use browser manual checks at desktop and narrow widths.
- Verify text does not overlap inside queue cards, buttons, tooltips, modals, or theater panel.
- Verify a missing thumbnail uses a tasteful fallback.

## Risks And Edge Cases

- Embedded players may steal pointer events. Keep page controls outside player iframe bounds or in separate overlay regions that do not block playback controls.
- Long video titles and channel names must clamp without changing card height dramatically.
- Browser autoplay restrictions may require a manual first play.

## Non-Goals

- Do not implement settings form internals here beyond modal entry points.
- Do not implement skip vote chat connection here.
