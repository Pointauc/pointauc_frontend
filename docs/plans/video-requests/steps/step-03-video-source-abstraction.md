# Step 03: Video Source Abstraction

## Goal

Implement a common video source provider interface and concrete providers for YouTube, Twitch clips, and Twitch VODs.

## Why This Step Exists

- Queue and player components should be source-agnostic.
- Parsing, metadata fetching, and player URL construction differ by platform and must stay isolated.

## Dependencies

- Requires: `step-01-route-and-domain-foundation`
- Unblocks: `step-04-bid-listening-and-request-ingestion`, source-aware parts of `step-05-player-queue-and-utility-ui`
- Can run in parallel with: `step-02-storage-and-state`

## Current-State Context

- `src/api/youtubeApi.ts` already has YouTube search/details helpers and API key rotation.
- `src/components/YoutubePlayer/YoutubePlayer.tsx` uses `youtube-player`, but the new feature needs a generic player path.
- `react-player` is installed and supports common media URLs, but Twitch behavior should be verified. Twitch iframe fallback is acceptable.
- Twitch embeds require a `parent` query parameter matching the current host.

## Implementation Plan

1. Define `VideoSourceProvider` in `src/domains/video-requests/model/sourceTypes.ts` with:
   - `id`
   - `labelTranslationKey`
   - `checkCanParse(message: string): boolean`
   - `parse(message: string): ParsedVideoReference | null`
   - `loadMetadata(reference: ParsedVideoReference): Promise<VideoMetadata>`
   - `buildPlayerUrl(reference: ParsedVideoReference): string`
2. Create `src/domains/video-requests/lib/sourceRegistry.ts` exporting the provider list and helpers to parse a message with the first matching provider.
3. Implement YouTube provider:
   - Parse `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, and `/embed/` URLs.
   - Reuse or extend `fetchYoutubeVideoById` to include views, likes, duration, thumbnail, channel, and published age when available.
   - Return fallback metadata if API quota fails: title from URL as `YouTube video`, unknown counts as `null`, and thumbnail from standard YouTube thumbnail URL.
4. Implement Twitch clip provider:
   - Parse `clips.twitch.tv/{slug}` and `twitch.tv/{channel}/clip/{slug}`.
   - Prefer Helix metadata if an accessible Twitch client/token path exists.
   - Fallback to slug-based title, Twitch clip URL, and empty statistics if metadata cannot be fetched.
   - Build player URL with `https://clips.twitch.tv/embed?clip={slug}&parent={host}&autoplay=true`.
5. Implement Twitch VOD provider:
   - Parse `twitch.tv/videos/{id}` and `player.twitch.tv/?video=v{id}` style URLs.
   - Preserve optional timestamp if present.
   - Build player URL with `https://player.twitch.tv/?video=v{id}&parent={host}&autoplay=true`.
6. Add formatting helpers for duration, compact counts, like percentage, and relative age under `lib/formatVideoMetadata.ts`.

## Files And Areas To Inspect

- `src/api/youtubeApi.ts`
- `src/models/youtube.ts`
- `src/components/YoutubePlayer/YoutubePlayer.tsx`
- `src/domains/video-requests/lib`
- `src/domains/video-requests/model`

## Acceptance Criteria

- A caller can pass a bid message and receive either a normalized parsed reference or `null`.
- Providers return player URLs that can be embedded by the UI.
- Metadata loading failure does not block request creation when the URL itself is valid.
- No UI component needs to inspect raw YouTube or Twitch URL shapes.

## Verification

- Run `pnpm run build`.
- Add focused tests for URL parsing helpers because they are pure and high-value.
- Manually verify example URLs:
  - `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - `https://youtu.be/dQw4w9WgXcQ`
  - `https://www.youtube.com/shorts/dQw4w9WgXcQ`
  - `https://clips.twitch.tv/SomeClipSlug`
  - `https://www.twitch.tv/some_channel/clip/SomeClipSlug`
  - `https://www.twitch.tv/videos/123456789`

## Risks And Edge Cases

- YouTube Shorts IDs follow normal video IDs but may have different playback UX.
- Twitch clips can be deleted or unavailable while still parseable.
- Twitch timestamp formats can vary; support common `?t=1h2m3s` and leave uncommon forms as future work.

## Non-Goals

- Do not implement moderation, duplicate detection, or manual search in this step.
- Do not add backend endpoints.
