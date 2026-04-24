# AI Agent Instructions

## General Engineering Rules

- Start implementation work with step-by-step planning.
- Consider performance implications, efficient error handling, and edge cases.
- Avoid example usage for new functionality unless explicitly requested.
- Avoid unit tests for new functionality unless explicitly requested.
- Avoid barrel exports such as `index.ts`.
- Use Dexie for IndexedDB operations.

## Code Style and Structure

- Prefer keeping files under 300 lines when splitting improves clarity.
- Favor modularization and reuse over duplication.
- Use descriptive variable names.
- Prefer boolean names like `isLoading`, `hasError`, `canSubmit`.
- Prefix boolean-returning helper functions with `check`, for example `checkIsLoading`.
- Use complete words instead of abbreviations, except:
  - `err`
  - `req`
  - `res`
  - `props`
  - `ref`
- Prefer arrow functions. Only use function declarations inside classes.

## Imports and Paths

- Prefer absolute imports using the project aliases.
- Existing aliases include:
  - `@assets`
  - `@components`
  - `@pages`
  - `@api`
  - `@constants`
  - `@decorators`
  - `@enums`
  - `@hooks`
  - `@models`
  - `@reducers`
  - `@services`
  - `@styles`
  - `@utils`
  - `@features`
  - `@shared`
  - `@types`
  - `@domains`
  - `@App`
  - `@store`
  - `@public`

## UI and Styling

- IMPORTANT: Always use Tailwind CSS for styles instead of the module CSS files.
- Use Mantine for basic UI components.
- If a Mantine-specific behavior is unclear, consult the Mantine LLM docs linked in `.cursor/rules/mantine.mdc`.

## React and TypeScript

- Use functional React components with TypeScript interfaces.
- Extract reusable logic into custom hooks when it improves clarity and reuse.
- Prefer efficient component composition over large monolithic components.

## Internationalization

- Always use translations for any user-visible text.
- Avoid string concatenation for translated text. Use interpolation instead.
- Keep translation keys synchronized across supported locales.
- Add new keys to `src/assets/i18n/locales/en.json` first and add matching stubs to `src/assets/i18n/locales/ru.json` in the same change unless told otherwise.

## Documentation in Code

- Add JSDoc for large or complex functions, classes, or flows. Describe business logic, purpose and architecture. Leave out types and contract for typescript.
- Keep comments brief and only for code that is not self-explanatory.
- If documentation is requested for architecture or data flow, keep it concise and focused.

## Unit Test Rules

- Apply these rules only when the AI agent is working with tests or was explicitly asked to add or update tests.
- Only write unit tests for this application.
- Place the test file in the same folder and on the same level as the source file it covers.
- Keep tests concise and compact. Prefer a small number of meaningful test cases over many narrow or repetitive ones.
- When related assertions describe one realistic behavior flow, combine them into a single test instead of splitting them into multiple overly granular cases.
- Cover the important and likely scenarios. Do not add tests for extremely unlikely edge cases unless they are explicitly requested or the code makes them important.
- Avoid excessive setup, deep nesting, repeated mocks, and long descriptive prose in test names.
- Prefer straightforward expectations that verify behavior directly over verbose, step-by-step assertion sequences.
- Do not add integration, e2e, snapshot, or example-style tests unless explicitly requested.

## Architecture Overview

The project follows an FSD-inspired target structure:

- `src/app`: app entry points, providers, routing, global boundaries, bootstrapping.
- `src/pages`: route-level composition only. No business logic here.
- `src/domains`: business slices containing UI, model, API, config, and local helpers.
- `src/shared`: cross-cutting utilities, base UI, constants, styles, and adapters.

The current codebase is in transition. Use this structure as the target direction for new work and refactors.

## Domain Slice Guidance

Preferred slice structure:

```text
src/domains/<slice>/
  api/
  model/
    state/
    types.ts
  ui/
  lib/
  config/
```

- Nested slices may import from their parent slice when reusing shared logic.

## Placement Rules

- Route composition belongs in `src/pages`.
- Feature-specific business logic and state belong in `src/domains/<slice>/model`.
- Feature-specific network code belongs in `src/domains/<slice>/api`.
- Feature-specific UI belongs in `src/domains/<slice>/ui`.
- Slice-local helpers belong in `src/domains/<slice>/lib`.
- Cross-cutting utilities belong in `src/shared`.

## Import Boundaries

- `pages -> domains/shared`: allowed.
- `domains -> domains`: allowed.
- `domains -> shared`: allowed.
- `shared -> domains`: not allowed.

## API Organization

- Treat `src/shared/api/openApi` as the source of truth for generated backend API clients and types.
- In slice `api/` folders, prefer external API adapters and slice-specific request helpers.
- Do not duplicate backend client logic already provided by `src/shared/api/openApi`.

## Migration Guidance

When touching legacy code, prefer moving toward the target structure:

- `src/components/**` -> `src/domains/<slice>/ui/**` or `src/shared/ui/**`
- `src/features/**` -> `src/domains/<slice>/**`
- `src/models/**` -> `src/domains/<slice>/model/**` or `src/shared/model/**`
- `src/reducers/**` -> `src/domains/<slice>/model/state/**` or `src/app/store/**`
- `src/services/**` -> `src/shared/api/openApi/**` for backend clients, otherwise relevant slice `api/**`
- `src/utils/**` -> `src/shared/lib/**`

- Temporary facade exports are acceptable during migration, but prefer updating imports in touched files to the target alias structure.
