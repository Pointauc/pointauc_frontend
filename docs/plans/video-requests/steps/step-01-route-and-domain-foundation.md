# Step 01: Route And Domain Foundation

## Goal

Create the route and domain skeleton for the video requests feature without implementing business behavior yet.

## Why This Step Exists

- Later storage, ingestion, and UI work need stable module paths.
- The page must live outside the current app shell so it can be used as a clean OBS/browser-source scene.

## Dependencies

- Requires: none
- Unblocks: all later steps
- Can run in parallel with: none

## Current-State Context

- `src/constants/routes.constants.ts` already defines `VIDEO_REQUESTS: '/videoPoints'`.
- `src/main.tsx` mounts `App` under `{ path: `${ROUTES.HOME}*`, element: <App /> }`.
- `App` includes `AppShell`, navbar, auction background, tutorial manager, and auction autosave.
- `src/App/entrypoint/AppMain.tsx` contains routes that render inside the shell; do not add the video request page there.

## Implementation Plan

1. Create `src/domains/video-requests/` with subfolders `api`, `config`, `lib`, `model`, and `ui`.
2. Create a minimal `VideoRequestsPage` component under `src/domains/video-requests/ui/Page/VideoRequestsPage.tsx`.
3. Add a lazy import in `src/main.tsx` and register `{ path: ROUTES.VIDEO_REQUESTS, element: <VideoRequestsPage /> }` as a root router child next to the overlay view route, outside the `App` branch.
4. Ensure the page is wrapped by the existing root providers from `src/main.tsx` so Mantine, React Query, hotkeys, Redux, notifications, and i18n are available.
5. Add route metadata for `ROUTES.VIDEO_REQUESTS` in the i18n metadata section if metadata handling reads from locale keys by path.

## Files And Areas To Inspect

- `src/main.tsx`
- `src/constants/routes.constants.ts`
- `src/App/entrypoint/AppMain.tsx`
- `src/assets/i18n/locales/en.json`
- `src/assets/i18n/locales/ru.json`

## Acceptance Criteria

- Visiting `/videoPoints` renders the video requests page without the `AppShell` navbar or auction layout.
- Existing app routes still render through `App`.
- The page has only translated placeholder text and no hardcoded user-visible strings.
- No business logic or persistent state is introduced in this step.

## Verification

- Run `pnpm run build`.
- Start the dev server and manually open `/videoPoints`.
- Confirm `/`, `/wheel`, and `/settings` still load normally.

## Risks And Edge Cases

- A catch-all route under `${ROUTES.HOME}*` can accidentally capture `/videoPoints` if ordering is wrong. Place the video requests route as an explicit sibling before or alongside the app route in a way React Router resolves correctly.
- SSR/prerender metadata may need a non-indexed entry if this route should not be public search content.

## Non-Goals

- Do not implement queue, player, source parsing, or bid listening in this step.
- Do not add navbar menu items unless product explicitly asks for navigation exposure.
