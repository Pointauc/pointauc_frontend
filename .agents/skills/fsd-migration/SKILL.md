---
name: fsd-migration
description: Procedures and mapping rules for migrating legacy codebase structures (src/components, src/features, src/models, src/reducers) into FSD domain slices and shared modules.
---

# Feature-Sliced Design (FSD) Migration Guide

Use this skill when refactoring legacy code into the target FSD architecture or organizing new domains.

## Target Structure Overview

```text
src/
├── app/                  # Application initialization, root providers, routing
├── pages/                # Route compositions (strictly no business logic)
├── domains/<slice>/      # Self-contained business slices
│   ├── api/              # Third-party APIs & domain request adapters
│   ├── model/            # Redux/Zustand state, selectors, types, business logic
│   ├── ui/               # Slice-specific React components
│   ├── lib/              # Scoped helper functions
│   └── config/           # Feature constants and configuration
└── shared/               # Reusable base UI, utilities, constants, and adapters
    ├── api/openApi/      # Generated backend API client (single source of truth)
    ├── lib/              # Cross-cutting utilities
    └── ui/               # Base UI primitives
```

## Legacy to Target Mapping

When touching or refactoring legacy modules, migrate them toward the target structure:

| Legacy Location | Target Location | Notes |
| :--- | :--- | :--- |
| `src/components/**` | `src/domains/<slice>/ui/**` or `src/shared/ui/**` | Feature-specific UI moves to domain; generic UI moves to shared |
| `src/features/**` | `src/domains/<slice>/**` | Maintain slice boundaries (`model`, `api`, `ui`, `lib`) |
| `src/models/**` | `src/domains/<slice>/model/**` or `src/shared/model/**` | Domain types to slice `model/types.ts`; global models to shared |
| `src/reducers/**` | `src/domains/<slice>/model/state/**` or `src/app/store/**` | Slice state to domain; root store setup to app |
| `src/services/**` | `src/shared/api/openApi/**` or `src/domains/<slice>/api/**` | Backend calls use OpenAPI client; external services to slice `api` |
| `src/utils/**` | `src/shared/lib/**` | General cross-cutting utilities |
| `src/pages/**` | `src/pages/**` | Extract any domain logic into appropriate `domains/<slice>` |

## Strict Import Rules During Migration

1. **No Barrel Files**:
   - **Do NOT create `index.ts` files** in slices or subfolders.
   - When touching imports that previously used barrel exports, update them to direct file imports:
     ```ts
     // ❌ Legacy / Incorrect
     import { AuctionPanel } from '@domains/auction';

     // ✅ Target
     import { AuctionPanel } from '@domains/auction/ui/AuctionPanel';
     ```
2. **Import Hierarchy**:
   - `pages` → `domains`, `shared` (allowed)
   - `domains` → `domains` (allowed via direct file imports)
   - `domains` → `shared` (allowed)
   - `shared` → `domains` (**forbidden**)
3. **Façade Exports**:
   - Temporary re-exports in old locations can be kept during transition if needed to avoid breaking untouched files, but actively touched files should use target aliases immediately.
