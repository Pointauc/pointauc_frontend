# Step 07: Twitch Chat Skip Voting

## Goal

Add browser-side anonymous Twitch chat integration and use it to power skip voting for the current video.

## Why This Step Exists

- Viewers need a lightweight way to vote to skip a video while it is playing.
- The requested implementation must connect to chat from the local browser without backend message transport.

## Dependencies

- Requires: `step-02-storage-and-state`
- Works best after: `step-05-player-queue-and-utility-ui`
- Can run in parallel with: `step-06-settings-and-next-selection`

## Current-State Context

- `tmi.js` is installed.
- `src/models/integration.ts` currently defines auth and pubsub flows but no chat flow.
- The Twitch integration exists at `src/domains/bids/external-integrations/Twitch/index.tsx`.
- The current Twitch auth scope is for redemptions, not necessarily chat. Anonymous read-only chat does not require sending messages.

## Implementation Plan

1. Extend `src/models/integration.ts` with optional `chatIntegration?: ChatIntegrationFlow`.
2. Define:
   - `ChatMessage` with channel, username, userId if present, message, timestamp, and raw tags.
   - `ChatIntegrationEvents` with `message`.
   - `ChatIntegrationFlow` with `events`, `connect(channel: string)`, `disconnect()`, and `store`.
   - Store state: `connected`, `loading`, optional `error`, optional `channel`.
3. Implement `TwitchChatIntegration` under `src/domains/bids/external-integrations/Twitch/chatIntegration.ts` using `tmi.js`.
4. Attach `chatIntegration` to the Twitch integration config.
5. Create `useSkipVoting` in `src/domains/video-requests/model/useSkipVoting.ts`:
   - Connects when skip voting is enabled and a channel is available.
   - Default channel comes from logged-in Twitch username.
   - Counts unique users who send the configured skip command.
   - If `allowDenySkip` is enabled, removes a user's skip vote when they send the deny command.
   - Resets votes when current video changes.
   - Triggers skip when vote count reaches required amount.
6. Update utility bar next/skip button styling when skip voting is enabled:
   - show remaining votes label
   - render a filled/wave-like background proportional to current votes / required votes
   - keep the button usable manually by the streamer.
7. Treat commands as trimmed, case-insensitive text matches for v1. 7tv emotes are handled as message text, not emote metadata.

## Files And Areas To Inspect

- `src/models/integration.ts`
- `src/domains/bids/external-integrations/Twitch/index.tsx`
- `src/domains/video-requests/model`
- `src/domains/video-requests/ui/Controls`
- `src/reducers/User/User.ts`

## Acceptance Criteria

- Twitch integration exposes an optional chat integration without affecting existing bid pubsub behavior.
- Skip voting connects anonymously to Twitch chat when enabled.
- Unique users can vote once per current video.
- Deny command removes a user's vote when enabled.
- Reaching the configured threshold skips the current video and resets votes for the next video.
- Vote progress is visible on the next/skip control.

## Verification

- Run `pnpm run build`.
- Manually test with a known Twitch channel and a low vote threshold.
- Verify disconnect on page unmount and when skip voting is disabled.
- Verify duplicate skip messages from the same user do not increase the count.

## Risks And Edge Cases

- Anonymous Twitch chat connections can be rate-limited or blocked by network conditions. Surface connection status in settings or utility UI.
- If no Twitch username is available, show a translated disconnected state and do not attempt to connect.
- Message tags can vary; use stable username fields with fallback to display name.

## Non-Goals

- Do not send chat messages from the app.
- Do not request new Twitch auth scopes in v1.
- Do not parse 7tv emote metadata beyond plain message text matching.
