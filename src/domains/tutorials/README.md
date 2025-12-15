# Tutorial System - Developer Guide

## Overview

This tutorial system provides an interactive way to guide users through app features with step-by-step instructions, element highlighting, and flexible positioning. It's designed to be tree-shakeable, type-safe, and easy to integrate.

## Quick Start

### 1. Create a Tutorial Definition

Create a tutorial file in your feature directory or in `src/domains/tutorials/tutorials/`:

```typescript
// src/domains/tutorials/tutorials/settingsTutorial.ts
import { Tutorial } from '@domains/tutorials';

export const settingsTutorial: Tutorial = {
  id: 'settings-overview',
  title: 'Settings Overview',
  description: 'Learn how to customize your app settings',
  startType: 'modal', // or 'notification'
  steps: [
    {
      id: 'step-1',
      title: 'Welcome to Settings',
      content: 'This is where you can customize your app experience.',
      position: { type: 'predefined', position: 'center' },
      progression: { type: 'button' },
    },
    {
      id: 'step-2',
      content: 'Click on the General tab to see basic settings.',
      targetElementId: 'general-tab',
      position: {
        type: 'element',
        position: {
          elementId: 'general-tab',
          relativePosition: 'bottom',
          offset: { y: 10 },
        },
      },
      highlightStyle: {
        type: 'spotlight',
        spotlightPadding: 8,
      },
      progression: {
        type: 'action',
        action: {
          actionId: 'click-general-tab',
          description: 'Click on the General tab',
          elementId: 'general-tab',
          type: 'click',
        },
      },
    },
  ],
};
```

### 2. Register Elements in Your Components

Use the `useTutorialElement` hook to register elements that will be highlighted or referenced:

```typescript
import { useTutorialElement } from '@domains/tutorials';

function SettingsPage() {
  const generalTabRef = useTutorialElement<HTMLButtonElement>('general-tab');
  
  return (
    <div>
      <button ref={generalTabRef}>General</button>
      {/* ... */}
    </div>
  );
}
```

### 3. Trigger the Tutorial

There are several ways to start a tutorial:

#### Option A: Start Modal (for important features)

```typescript
import { useState, useEffect } from 'react';
import { useTutorial, TutorialStartModal } from '@domains/tutorials';
import { settingsTutorial } from './settingsTutorial';

function SettingsPage() {
  const { startTutorial, isTutorialCompleted } = useTutorial();
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    // Show modal if tutorial not completed
    if (!isTutorialCompleted(settingsTutorial.id)) {
      setShowStartModal(true);
    }
  }, [isTutorialCompleted]);

  return (
    <>
      <TutorialStartModal
        tutorial={settingsTutorial}
        opened={showStartModal}
        onStart={() => startTutorial(settingsTutorial)}
        onClose={() => setShowStartModal(false)}
      />
      {/* Your page content */}
    </>
  );
}
```

#### Option B: Start Notification (for smaller features)

```typescript
import { TutorialStartNotification, useTutorial } from '@domains/tutorials';
import { settingsTutorial } from './settingsTutorial';

function SettingsPage() {
  const { startTutorial } = useTutorial();

  return (
    <>
      <TutorialStartNotification
        tutorial={settingsTutorial}
        onStart={() => startTutorial(settingsTutorial)}
      />
      {/* Your page content */}
    </>
  );
}
```

#### Option C: Manual Trigger (button or menu)

```typescript
import { useTutorial } from '@domains/tutorials';
import { settingsTutorial } from './settingsTutorial';

function HelpButton() {
  const { startTutorial } = useTutorial();

  return (
    <button onClick={() => startTutorial(settingsTutorial)}>
      Start Tutorial
    </button>
  );
}
```

## API Reference

### Hooks

#### `useTutorial()`

Access the tutorial context.

```typescript
const {
  activeTutorial,        // Currently active tutorial or null
  currentStepIndex,      // Current step index (0-based)
  elementRefs,           // Map of registered element refs
  startTutorial,         // Start a tutorial
  stopTutorial,          // Stop current tutorial
  nextStep,              // Go to next step
  previousStep,          // Go to previous step
  registerElement,       // Register an element ref
  unregisterElement,     // Unregister an element ref
  triggerAction,         // Trigger an action for progression
  isTutorialCompleted,   // Check if tutorial is completed
  markTutorialCompleted, // Mark tutorial as completed
} = useTutorial();
```

#### `useTutorialElement<T>(elementId: string)`

Register an element for use in tutorials. Returns a ref that should be attached to the element.

```typescript
const buttonRef = useTutorialElement<HTMLButtonElement>('my-button-id');
return <button ref={buttonRef}>Click me</button>;
```

#### `useTutorialAction(actionId: string)`

Get a function to manually trigger an action (for custom progression logic).

```typescript
const triggerSaveAction = useTutorialAction('save-settings');

const handleSave = () => {
  // Your save logic
  triggerSaveAction(); // Advances tutorial if waiting for this action
};
```

#### `useTutorialActionCallback(actionId: string, callback: Function)`

Wrap a callback to automatically trigger a tutorial action when called.

```typescript
const handleSave = useTutorialActionCallback('save-settings', () => {
  // Your save logic
});
```

### Types

#### `Tutorial`

```typescript
interface Tutorial {
  id: string;                    // Unique identifier
  title: string;                 // Tutorial title
  description: string;           // Description (shown in start modal)
  startType: 'modal' | 'notification';  // How to initiate
  steps: TutorialStep[];         // Array of steps
  onStart?: () => void;          // Callback when tutorial starts
  onComplete?: () => void;       // Callback when tutorial completes
  onCancel?: () => void;         // Callback when tutorial is cancelled
}
```

#### `TutorialStep`

```typescript
interface TutorialStep {
  id: string;                    // Unique step identifier
  title?: string;                // Optional step title
  content: ReactNode;            // Step content (can be JSX)
  targetElementId?: string;      // Element to highlight
  position: TutorialPosition;    // Popup position
  highlightStyle?: HighlightStyle;  // How to highlight element
  progression: StepProgression;  // How to advance to next step
  onEnter?: () => void;          // Callback when step becomes active
  onExit?: () => void;           // Callback when leaving step
}
```

#### `TutorialPosition`

Three types of positioning:

```typescript
// Predefined position
{ type: 'predefined', position: 'center' | 'top' | 'bottom' | 'left' | 'right' }

// Absolute position
{ type: 'absolute', position: { top?: string, bottom?: string, left?: string, right?: string } }

// Element-relative position
{
  type: 'element',
  position: {
    elementId: string,
    relativePosition: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    offset?: { x?: number, y?: number }
  }
}
```

#### `HighlightStyle`

```typescript
interface HighlightStyle {
  type: 'outline' | 'background' | 'spotlight' | 'none';
  spotlightPadding?: number;     // Padding around element (spotlight only)
  outlineColor?: string;         // Outline color (outline only)
  backgroundColor?: string;      // Background color (background only)
}
```

#### `StepProgression`

```typescript
// Button-based progression
{ type: 'button' }

// Action-based progression
{
  type: 'action',
  action: {
    actionId: string,            // Unique action identifier
    description: string,         // What user needs to do
    elementId?: string,          // Element to interact with
    type?: 'click' | 'input' | 'custom'
  }
}
```

### Components

#### `TutorialProvider`

Wrap your app with this provider (already integrated in `main.tsx`).

```typescript
import { TutorialProvider } from '@domains/tutorials';

<TutorialProvider>
  <App />
</TutorialProvider>
```

#### `TutorialManager`

Renders the active tutorial. Already integrated in `App.tsx`.

#### `TutorialStartModal`

Modal for starting tutorials (important features).

```typescript
<TutorialStartModal
  tutorial={myTutorial}
  opened={isOpen}
  onStart={() => startTutorial(myTutorial)}
  onClose={() => setIsOpen(false)}
/>
```

#### `TutorialStartNotification`

Notification for starting tutorials (smaller features).

```typescript
<TutorialStartNotification
  tutorial={myTutorial}
  onStart={() => startTutorial(myTutorial)}
/>
```

### Services

#### Tutorial Storage

```typescript
import {
  isTutorialCompleted,
  markTutorialCompleted,
  isTutorialDismissed,
  markTutorialDismissed,
  resetTutorialCompletion,
  resetTutorialDismissed,
  getAllCompletedTutorials,
  clearAllTutorialData,
} from '@domains/tutorials';

// Check completion status
if (isTutorialCompleted('my-tutorial-id')) {
  // Tutorial was completed
}

// Mark as completed manually
markTutorialCompleted('my-tutorial-id');

// Get all completed tutorial IDs
const completed = getAllCompletedTutorials();
```

## Best Practices

### 1. Tutorial Structure

- **Keep tutorials short**: 3-7 steps is ideal
- **One concept per step**: Don't overwhelm users
- **Clear progression**: Users should always know what to do next
- **Provide context**: Explain why a feature is useful

### 2. Element Highlighting

- **Use spotlight for critical elements**: When you really need attention
- **Use outline for subtle highlights**: When element is already visible
- **Use background sparingly**: Can be distracting if overused
- **Test visibility**: Ensure highlighted elements are actually visible

### 3. Positioning

- **Element-relative for UI interactions**: When highlighting specific elements
- **Predefined positions for explanations**: When not focused on specific element
- **Test on different screen sizes**: Ensure popups don't go off-screen

### 4. Action-Based Progression

- **Be specific**: "Click the Save button" is better than "Save your changes"
- **Highlight the action element**: Make it obvious what to interact with
- **Provide feedback**: Show that the action was successful

### 5. Content Writing

- **Use simple language**: Avoid jargon
- **Be concise**: Get to the point quickly
- **Use active voice**: "Click here" not "This should be clicked"
- **Add personality**: Make it friendly and engaging

## Examples

### Example 1: Simple Explanation Tutorial

```typescript
export const welcomeTutorial: Tutorial = {
  id: 'welcome',
  title: 'Welcome to the App',
  description: 'A quick tour of the main features',
  startType: 'modal',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome!',
      content: 'Let me show you around the app.',
      position: { type: 'predefined', position: 'center' },
      progression: { type: 'button' },
    },
    {
      id: 'menu',
      content: 'Use this menu to navigate between pages.',
      targetElementId: 'main-menu',
      position: {
        type: 'element',
        position: { elementId: 'main-menu', relativePosition: 'right' },
      },
      highlightStyle: { type: 'outline' },
      progression: { type: 'button' },
    },
  ],
};
```

### Example 2: Interactive Tutorial with Actions

```typescript
export const formTutorial: Tutorial = {
  id: 'create-item',
  title: 'Create Your First Item',
  description: 'Learn how to add new items',
  startType: 'notification',
  steps: [
    {
      id: 'click-add',
      content: 'First, click the "Add Item" button.',
      targetElementId: 'add-button',
      position: {
        type: 'element',
        position: { elementId: 'add-button', relativePosition: 'top' },
      },
      highlightStyle: { type: 'spotlight' },
      progression: {
        type: 'action',
        action: {
          actionId: 'click-add-button',
          description: 'Click the "Add Item" button',
          elementId: 'add-button',
          type: 'click',
        },
      },
    },
    {
      id: 'fill-name',
      content: 'Enter a name for your item.',
      targetElementId: 'item-name-input',
      position: {
        type: 'element',
        position: { elementId: 'item-name-input', relativePosition: 'bottom' },
      },
      highlightStyle: { type: 'outline' },
      progression: {
        type: 'action',
        action: {
          actionId: 'fill-name',
          description: 'Type a name in the input field',
          elementId: 'item-name-input',
          type: 'input',
        },
      },
    },
  ],
};
```

### Example 3: Tutorial with Custom Actions

For complex interactions that can't be detected automatically:

```typescript
// In your component
const completeCustomAction = useTutorialAction('custom-action');

const handleComplexInteraction = () => {
  // Your complex logic
  doSomethingComplex();
  
  // Trigger tutorial progression
  completeCustomAction();
};

// In your tutorial
const tutorial: Tutorial = {
  // ...
  steps: [
    {
      id: 'complex-step',
      content: 'Complete this complex interaction.',
      progression: {
        type: 'action',
        action: {
          actionId: 'custom-action',
          description: 'Complete the interaction',
          type: 'custom',
        },
      },
    },
  ],
};
```

## Troubleshooting

### Tutorial not starting

- Check that `TutorialProvider` is wrapping your app
- Verify tutorial hasn't been completed (check localStorage)
- Check console for errors

### Element not highlighting

- Ensure element is registered with `useTutorialElement`
- Verify `targetElementId` matches the registered ID
- Check that element is mounted when tutorial starts

### Popup positioned incorrectly

- Verify element ref is properly attached
- Check viewport bounds (popup may be adjusted to stay on screen)
- Try different relative positions or add offsets

### Action not progressing tutorial

- Ensure `actionId` matches between step and trigger
- For click actions, verify element ref is correct
- Check console for action detection logs

## Contributing

When adding new features to the tutorial system:

1. Update type definitions in `models/tutorial.model.ts`
2. Add corresponding implementation
3. Update this documentation
4. Add examples demonstrating the new feature
5. Update i18n keys if needed

