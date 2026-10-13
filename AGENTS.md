# Pointauc Frontend — Project Guidelines

## Architecture & Code Organization (FSD-Inspired)

The project follows a Feature-Sliced Design (FSD) architecture organized into four primary layers (top to bottom):

```text
src/
├── app/       # Application bootstrap, root providers, routing setup, global error boundaries
├── pages/     # Route-level composition only (no business logic)
├── domains/   # Consolidated business feature slices (UI, state, API, helpers)
└── shared/    # Cross-cutting reusable utilities, base UI, styles, constants, and adapters
```

### Layer Responsibilities

1. **`src/app`**: Global providers, application entry point (`App.tsx`), routing definitions, and store bootstrapping.
2. **`src/pages`**: Composes domain slices and shared UI for specific routes. **Pages must never contain business logic or domain state.**
3. **`src/domains/<slice>`**: Autonomous business domain slices. Recommended internal folder structure:
   ```text
   src/domains/<slice>/
   ├── api/       # External/third-party API adapters and slice-specific request helpers
   ├── model/     # State (Redux/Zustand), types, business logic, selectors
   ├── ui/        # React components specific to this domain
   ├── lib/       # Helper utilities strictly scoped to this slice
   └── config/    # Constants, feature flags, and slice configuration
   ```
4. **`src/shared`**: Reusable modules independent of any single business domain (`ui`, `lib`, `api`, `constants`, `styles`).

### Import Rules & Boundaries

- **`pages` → `domains`, `shared`**: Allowed. Pages compose features and shared components.
- **`domains` → `domains`**: Allowed. Direct cross-domain dependencies are permitted when necessary.
- **`domains` → `shared`**: Allowed. Slices leverage shared infrastructure.
- **`shared` → `domains`**: **Strictly forbidden.** Shared code must remain completely decoupled from business domains.

### Strict Prohibition of Barrel Files (`index.ts`)

- Always import directly from the concrete source file (e.g. `import { AuctionPanel } from '@domains/auction/ui/AuctionPanel';`).
- When refactoring existing code, replace barrel imports with direct file imports.

### Path Aliases

Use absolute path aliases defined in `tsconfig.json`:

- `@domains/*` → `src/domains/*`
- `@shared/*` → `src/shared/*`
- `@pages/*` → `src/pages/*`
- `@app/*` → `src/app/*`
- `@assets/*` → `src/assets/*`
- `@constants/*`, `@hooks/*`, `@models/*`, `@services/*`, `@styles/*`, `@utils/*` (legacy aliases supported during migration)

### API Organization

- **Generated OpenAPI Client**: Backend API client types and endpoints reside in `src/shared/api/openApi`. Treat this as the single source of truth for backend communication. Do not duplicate backend requests in slice directories.
- **Slice API (`domains/<slice>/api`)**: Reserved for third-party external services, WebSockets, or domain-specific request adapters.

---

## UI & Styling Guidelines

- **Tailwind CSS First**: Always use Tailwind CSS for styling instead of CSS Modules (`*.module.scss`/`*.module.css`).
- **Mantine UI**: Use Mantine for core UI primitives (buttons, modals, inputs, menus, notifications).
- **Aesthetic**: Maintain a clean, tasteful, and professional visual appearance. Avoid excessive flashy gradients for standard interface elements.

---

## React & TypeScript Practices

- **One Component per File**: Each file must contain only a single React component. Decompose larger components into focused child files.
- **Custom Hooks**: Extract stateful or reusable component logic into custom hooks.

---

## Internationalization (i18n)

- **Mandatory Localization**: All user-visible strings must be localized using `react-i18next` (`useTranslation()` or `<Trans />`).
- **No Concatenation**: Avoid string concatenation for translated text—use i18n interpolation variables.
- **Locale Synchronization**: When adding, modifying, or deleting translation keys:
  - Add to `src/assets/i18n/locales/en.json`.
  - Add corresponding keys/stubs to `src/assets/i18n/locales/ru.json` in the same change.

---

## Testing Strategy & Guidelines

- **On-Demand Only**: Write or update tests **only when explicitly requested** by the developer.
- **Separation of Test Types**:
  - **Unit Tests**:
    - **Usage**: Used selectively for heavy computations, complex algorithms, tricky combinatorial logic, or parsing pipelines with many edge cases.
    - **Characteristics**: Fast, isolated, lightweight tests validating specific functions, schemas, or reducers with diverse input combinations.
  - **Integration Tests (Primary Testing Flow)**:
    - **Usage**: The primary testing approach for the application.
    - **Characteristics**: Verifies large chunks of the application—entire component subtrees, domain feature slices, or complete page flows—working together using Vitest, `@testing-library/react`, and user event simulations.
- **Co-Location**: Place test files directly next to the source file they cover (e.g. `splitBidSuggestions.test.ts` alongside `splitBidSuggestions.ts`).
- **Test Style**:
  - Prefer concise, high-value test cases representing realistic user or data flows over excessive granular micro-assertions.
