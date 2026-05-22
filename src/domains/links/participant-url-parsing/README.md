# Participant URL Parsing

This module is the shared entry point for resolving external links in participant-controlled text, such as auction lot names and video request bid messages.

## Architecture

- Sources live in `sources/<source>/` and are registered in `sources/index.ts`.
- `sourceByDomainMap` maps normalized hostnames to registered sources.
- A source owns its URL validation, identifier extraction, canonical URL building, metadata provider fallback chain, and source-specific metadata normalization.
- `parseLink` is the lightweight path used by auction participant parsing to create readable markdown labels.
- `getVideoRequestMetadata` is an optional richer capability for sources that can provide playable video-request metadata.
- Callers should use the registered source contract instead of implementing source-specific URL parsing in feature code.

## Runtime Flow

1. Extract the first supported plain URL and skip existing markdown links when relevant.
2. Resolve the URL domain through `sourceByDomainMap`.
3. Validate the URL with `source.checkIsValidLink(link)`.
4. For auction display, call `source.parseLink({ link, signal })`.
5. For video requests, call `source.getVideoRequestMetadata({ link, signal })` when the source supports it.

## Adding A Source

1. Create a folder under `sources/<source>/`.
2. Add helpers for URL validation, identifier extraction, and canonical URL construction.
3. Add providers under `providers/` when metadata requires network or fallback logic.
4. Export a `ParticipantUrlSource` with `sourceName`, `domains`, `checkIsValidLink`, `parseLink`, and optional `getVideoRequestMetadata`.
5. Register the source in `sources/index.ts`.
6. Add focused tests for source helpers and supported URL shapes.

## Shared Areas

- `shared/sourceRegistry.ts`: domain-to-source lookup.
- `shared/providers/`: generic metadata providers reusable by multiple sources.
- `shared/url.ts`: domain extraction and normalization.
- `shared/jsonLd.ts`: structured data helpers for scraping providers.
- `shared/valueParsers.ts`: parsing helpers for source values.
