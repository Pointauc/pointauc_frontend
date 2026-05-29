# Archive Feature

Browser-based archive system for saving and restoring auction states using IndexedDB.

## Structure

```
src/domains/auction/archive/
├── api/
│   ├── ArchiveApi.ts           - Abstract base class for archive operations
│   ├── IndexedDBAdapter.ts     - IndexedDB implementation
│   └── hooks.ts                - React Query hooks
├── model/
│   ├── types.ts                - TypeScript interfaces
│   └── constants.ts            - Constants (DB names, query keys)
├── ui/
│   ├── ArchiveModal.tsx        - Main modal with tabs
│   ├── ArchiveList.tsx         - List of archives
│   ├── ArchiveItem.tsx         - Single archive row
│   ├── AutoloadAutosave.tsx    - Auto-loads autosave on app start
│   └── *.module.css            - Component styles
└── lib/
    ├── converters.ts           - Slot ↔ ArchivedLot conversion
    └── validators.ts           - Data validation utilities
```

## Features

### Core Functionality

- **Create Archive**: Save current auction state with custom name
- **Load Archive**: Click on any archive card to load it (with confirmation if current lots exist)
- **Rename Archive**: Edit name directly in the input field (auto-saves after 500ms)
- **Overwrite Archive**: Replace archive data with current auction state
- **Delete Archive**: Remove archive (autosave cannot be deleted)
- **Export Archive**: Download archive as JSON file
- **Import Archive**: Upload archive from JSON file

### Autosave

- Automatically saves every 2 seconds when slots change (debounced)
- Saves on page unload if lots exist
- Auto-loads on app start if no current lots exist
- Cannot be deleted, but can be renamed
- Always appears first in the list

### UI Features

- **Click to Load**: Simply click on an archive card to load it
- **Inline Editing**: Archive names are editable input fields with auto-save (500ms debounce)
- **Visual Feedback**: Cards highlight on hover with blue border and shadow
- **Dismissible Alert**: Info message explaining click-to-load (persists dismissal in localStorage)
- **Search & Sort**: Filter by name, sort by name/created/updated date
- **Two Tabs**: "My Archives" and "Import/Export"
- **Loading States**: Visual feedback for all operations
- **Notifications**: Success/error messages for all actions
- **Smart Timestamps**: Only updates `updatedAt` when data is overwritten, not on rename
- **Dynamic Display**: Shows `updatedAt` or `createdAt` based on current sort option
- **Tooltips**: Clear explanations for all action buttons
- **Smooth Animations**: Polished transitions and hover effects

## Usage

### From Code

```typescript
// Import hooks
import { useArchives, useCreateArchive, useLoadArchive, useUpdateArchive } from '@domains/auction/archive/api/hooks';

// Use in component
const { data: archives } = useArchives();
const createMutation = useCreateArchive();
const loadMutation = useLoadArchive();
const updateMutation = useUpdateArchive();

// Create archive
createMutation.mutate({
  name: 'My Archive',
  data: { lots: archivedLots },
});

// Load archive
loadMutation.mutate(archiveId);

// Rename (does NOT update updatedAt)
updateMutation.mutate({
  id: archiveId,
  name: 'New Name',
});

// Overwrite (DOES update updatedAt)
updateMutation.mutate({
  id: archiveId,
  data: { lots: newArchivedLots },
});
```

### From UI

Access via the Archive button (📦 icon) in the auction actions toolbar.

## Migration to Backend API

To switch from IndexedDB to backend API:

1. Create `api/BackendAdapter.ts` extending `ArchiveApi`
2. Implement all abstract methods
3. Update the singleton export in `api/IndexedDBAdapter.ts` (or `ArchiveApi.ts`) to use environment config
4. React Query hooks and UI components remain unchanged

## Data Models

### ArchiveRecord

```typescript
{
  id: string; // UUID or "autosave"
  name: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  data: string; // JSON.stringify({ lots: ArchivedLot[] })
  isAutosave: boolean;
}
```

### ArchivedLot

```typescript
{
  name: string | null;
  amount: number | null;
  contributors?: { name: string; amount: number }[];
}
```

## Internationalization

Translation keys added to `en.json` and `ru.json`:

- `archive.modal.*` - Modal UI strings
- `archive.item.*` - Archive item strings
- `archive.notifications.*` - Success/error messages
- `archive.loading.*` - Loading state messages
- `archive.export.*` - Export functionality
- `archive.import.*` - Import functionality
