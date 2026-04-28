# Participant URL Parsing

This module resolves plain links inside lot names into human-readable markdown links (for example, IMDb title links).

## How it works

1. `LotLinkParser` parses the first link from the lot name and skips markdown links.
2. It extracts the link domain and finds a source from `sourceByDomainMap`.
3. The matched source validates the link format/id.
4. The source loads metadata through its provider fallback chain.
5. The parser replaces the original link segment with a markdown link.

## Add a new source

1. Create `src/domains/links/participant-url-parsing/sources/<source>/index.ts`.
2. Export a `ParticipantUrlSource` object with:
   - `sourceName` (for UI tooltip)
   - `domains` (all supported hostnames)
   - `checkIsValidLink(link)`
   - `parseLink({ link, signal })`
3. Add source-specific helpers in `sources/<source>/helpers.ts` (id extraction, link checks, etc.).
4. Add source-specific providers in `sources/<source>/providers/` and define provider fallback order in `providers/index.ts`.
5. Reuse common providers from `shared/providers/` where possible (`tmdb`, `wikidata`, `scrape`).
6. Register the source in `sources/index.ts`.

## Shared areas

- `shared/providers/`: generic data providers reusable by multiple sources.
- `shared/`: parser orchestration and generic helpers (domain map, URL parsing, JSON-LD parsing, value parsing).

