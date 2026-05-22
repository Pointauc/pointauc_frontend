# Step 03: External Link Source Abstraction

## Goal

Extend the existing `src/domains/links/participant-url-parsing` source architecture so video requests reuse the same external-service entry points as auction participant link parsing. Do not create a parallel video-only source registry.

## Why This Step Exists

- The app already has a source-based architecture for external links: source registration, domain lookup, link validation, helpers, and metadata provider fallback chains.
- Video requests need richer metadata than auction lot markdown parsing, but the source identity and link parsing rules should stay centralized.
- YouTube and Twitch should become reusable external-source libraries that any feature can call, instead of each feature reimplementing URL parsing and metadata loading.

## Dependencies

- Requires: `step-01-route-and-domain-foundation`
- Unblocks: `step-04-bid-listening-and-request-ingestion`, source-aware parts of `step-05-player-queue-and-utility-ui`
- Can run in parallel with: `step-02-storage-and-state`

## Current-State Context

- Read `src/domains/links/participant-url-parsing/README.md` before implementation.
- `ParticipantUrlSource` currently lives in `src/domains/links/participant-url-parsing/types.ts` with `sourceName`, `domains`, `checkIsValidLink`, and `parseLink`.
- `LotLinkParser` and `parseParticipantUrl` already resolve a URL domain through `sourceByDomainMap` and call `checkIsValidLink` before parsing.
- Existing sources live in `src/domains/links/participant-url-parsing/sources/<source>/`.
- YouTube source already supports participant URL parsing through `sources/youtube` and currently uses an oEmbed provider for simple video data.
- Twitch is not yet registered as a participant URL source.

## Implementation Plan

1. Extend link-domain contracts in `src/domains/links/participant-url-parsing/types.ts`.
   - Add `twitch` to `ParticipantUrlParsingSource`.
   - Add provider names for `youtube-data-api`, `twitch-helix-clips`, `twitch-helix-videos`, and fallback providers if used.
   - Add shared video-request metadata types in this links domain, not in the video requests UI layer. Include source id, canonical URL, player/embed URL data, title, channel name, thumbnail URL, duration seconds, view count, like count when available, published/created date, and source-specific reference data.
   - Add the requested video-request capability to `ParticipantUrlSource` as optional `getVideoRequestMetadata(params)`. Use lower-camel TypeScript spelling for the property, while documenting it as the "GetVideoRequestMetadata" capability.
2. Keep `parseLink` focused on auction participant/lot display.
   - It should continue returning `ParsedParticipantUrlResult` with markdown link and lightweight metadata.
   - For video services, participant parsing should use only simple display metadata, mostly title and canonical URL, so auction lot linkification stays fast and resilient.
3. Update YouTube source.
   - Reuse existing helpers such as `checkIsYoutubeVideoUrl`, `extractYoutubeVideoId`, and `buildYoutubeVideoUrl`.
   - Keep oEmbed as the lightweight participant parsing provider.
   - Add a richer provider that calls YouTube Data API `videos.list` by `id` with `part=snippet,contentDetails,statistics,status`.
   - Use `snippet.title`, `snippet.channelTitle`, `snippet.publishedAt`, best thumbnail, `contentDetails.duration`, `statistics.viewCount`, optional `statistics.likeCount`, and `status.embeddable` where available.
   - Parse ISO 8601 duration into seconds in a source helper or shared value parser.
   - If Data API quota/auth fails, fall back to oEmbed plus deterministic thumbnail URL and leave unavailable fields as `null`.
4. Add Twitch source under `src/domains/links/participant-url-parsing/sources/twitch/`.
   - Support domains `twitch.tv`, `www.twitch.tv`, `m.twitch.tv`, `clips.twitch.tv`, and `player.twitch.tv`.
   - Add helpers for:
     - clip slug extraction from `clips.twitch.tv/{slug}` and `twitch.tv/{channel}/clip/{slug}`;
     - VOD id extraction from `twitch.tv/videos/{id}` and `player.twitch.tv/?video=v{id}`;
     - optional VOD start time extraction from common `?t=1h2m3s` values;
     - canonical clip and VOD URL builders;
     - embed URL builders that include the current browser host as Twitch `parent`.
   - Implement `checkIsValidLink` by accepting only recognized clip or VOD URLs.
   - Implement `parseLink` for auction participants with lightweight metadata: title when available, otherwise a clear fallback like `Twitch clip` or `Twitch video`, plus canonical link.
   - Implement `getVideoRequestMetadata` using Twitch Helix when an accessible token/client path exists:
     - `Get Clips` for clip title, broadcaster/channel, view count, thumbnail URL, duration, created date, and embed URL.
     - `Get Videos` for VOD title, user/channel, view count, thumbnail URL, duration string, created/published date, and URL.
   - If Helix metadata is unavailable, return fallback metadata from the parsed URL so valid Twitch requests can still be queued.
5. Update registration.
   - Register the new Twitch source in `sources/index.ts`.
   - Ensure domain collisions are intentional and normalized through the existing `sourceByDomainMap`.
6. Add a source lookup helper for video requests.
   - Add a small helper in the links domain that extracts the first plain URL from a message, resolves the matching `ParticipantUrlSource`, validates it with `checkIsValidLink`, and calls `getVideoRequestMetadata` when available.
   - Video requests should call this helper instead of scanning a separate provider list.
   - If a source supports participant parsing but not video metadata, the helper should return `null` rather than treating it as an error.
7. Keep player construction source-owned.
   - YouTube metadata should expose enough data for the video requests player to build or receive an embeddable URL.
   - Twitch metadata must expose iframe/embed URL data with required `parent`.
   - UI components should not parse raw YouTube or Twitch URLs.

## Files And Areas To Inspect

- `src/domains/links/participant-url-parsing/README.md`
- `src/domains/links/participant-url-parsing/types.ts`
- `src/domains/links/participant-url-parsing/parseParticipantUrl.ts`
- `src/domains/links/participant-url-parsing/shared/LotLinkParser.ts`
- `src/domains/links/participant-url-parsing/shared/sourceRegistry.ts`
- `src/domains/links/participant-url-parsing/sources/youtube`
- `src/domains/links/participant-url-parsing/sources/index.ts`
- `src/api/youtubeApi.ts`
- `src/api/twitchApi.ts`

## Acceptance Criteria

- Video requests use the links-domain source registry and do not introduce a separate video source abstraction.
- `ParticipantUrlSource` has the optional `getVideoRequestMetadata` capability.
- YouTube participant URL parsing still works with lightweight oEmbed metadata.
- YouTube video request metadata uses Data API details when available and falls back gracefully.
- Twitch clip and VOD links are valid participant URLs and can produce lightweight auction metadata.
- Twitch clip and VOD links can produce video request metadata, with Helix fields when available and URL-derived fallback otherwise.
- No UI component needs to inspect raw YouTube or Twitch URL shapes.

## Verification

- Run `pnpm run build`.
- Add focused tests for pure URL helpers and source lookup:
  - YouTube `watch`, `youtu.be`, `shorts`, `embed`.
  - Twitch `clips.twitch.tv/{slug}`.
  - Twitch `twitch.tv/{channel}/clip/{slug}`.
  - Twitch `twitch.tv/videos/{id}`.
  - Twitch `player.twitch.tv/?video=v{id}`.
  - Twitch VOD timestamp parsing for `?t=1h2m3s`.
- Manually verify auction participant parsing still replaces supported links with markdown labels.
- Manually verify video request lookup returns `null` for supported non-video participant sources like IMDb and Kinopoisk.

## Risks And Edge Cases

- YouTube oEmbed does not provide views, likes, duration, or embeddability, so it must not be the only provider for video requests.
- YouTube `statistics.likeCount` can be absent; store `null` rather than treating it as zero.
- Twitch Helix endpoints require authorization. If the current frontend cannot call them directly, use graceful fallback and leave a clear seam for a backend/client adapter.
- Twitch embeds require a `parent` parameter for every embedding domain.
- Twitch clip `video_id` and `vod_offset` can be empty or null for unavailable or fresh clips.
- Twitch VOD duration is returned as a string such as `6h26m14s`, unlike YouTube's ISO 8601 duration.

## Non-Goals

- Do not implement moderation, duplicate detection, or manual search in this step.
- Do not add backend endpoints unless separately approved.
- Do not move existing IMDb or Kinopoisk source logic.
