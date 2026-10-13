---
name: mantine
description: Guidance, best practices, and reference patterns for Mantine UI components, forms, modals, notifications, and Tailwind CSS integration in Pointauc.
---

# Mantine UI Component & Integration Guide

This skill provides patterns, best practices, and integration techniques for utilizing [Mantine](https://mantine.dev) within the Pointauc frontend.

## Key Principles

- **Mantine Primitives + Tailwind CSS**: Use Mantine for component behavior, accessibility, and primitives (e.g. `Modal`, `Menu`, `Select`, `Button`, `Notifications`, `Dropzone`). Apply custom styling via Tailwind classes (`className="..."`) rather than CSS modules.
- **Controlled vs Uncontrolled**:
  - Prefer controlled components when state interacts with Redux or complex form flows.
  - For standard forms, use `@mantine/form` or `react-hook-form` with Mantine inputs (`TextInput`, `NumberInput`, `Select`).

## Testing Components with Mantine

When testing components that rely on Mantine in Vitest with `@testing-library/react`, always wrap the rendered component in `<MantineProvider>`:

```tsx
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};
```

If components use modals or notifications:
- Ensure portals can mount or mock modals manager when testing isolated component state.
- Global browser mocks for `matchMedia`, `ResizeObserver`, and `IntersectionObserver` are pre-configured in `src/shared/test/setupTests.ts`.

## Common Mantine Patterns

### 1. Notifications

Always import from `@mantine/notifications`:

```tsx
import { notifications } from '@mantine/notifications';

notifications.show({
  title: t('common.success'),
  message: t('auction.savedSuccess'),
  color: 'teal',
});
```

### 2. Modals

For declaratively managed dialogs:
```tsx
import { Modal } from '@mantine/core';

<Modal opened={isOpen} onClose={handleClose} title={t('dialog.title')} centered>
  {/* Content */}
</Modal>
```

### 3. Forms & Validation

For simple to medium complexity forms, `@mantine/form` or `react-hook-form` can be used:
- Always tie error messages to i18n keys.
- Ensure inputs have accessible labels or `aria-label` attributes.

## Mantine LLM References

For deep API questions or complex component documentation:
- Full documentation text index: https://mantine.dev/llms-full.txt
- Component-specific guides: `https://mantine.dev/llms/core-<component>.md` (e.g. `core-modal.md`, `core-select.md`)
