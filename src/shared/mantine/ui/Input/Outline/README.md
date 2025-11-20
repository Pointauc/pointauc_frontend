# Extended TextInput with Outline Variant

This extended TextInput component includes a custom "outline" variant with floating label functionality.

## Usage

```tsx
import { TextInput } from '@mantine/core';

function MyComponent() {
  return (
    <div>
      {/* Regular variants work as usual */}
      <TextInput label='Default variant' placeholder='Enter text' />

      {/* New outline variant with floating label */}
      <TextInput
        variant='outline'
        label='Floating Label'
        placeholder='' // Leave empty for best floating effect
      />
    </div>
  );
}
```

## Features

- **Transparent background**: The input has a transparent background
- **Floating label**: When the input is focused or has content, the label moves to the top of the border
- **Smooth animations**: All transitions are animated for a smooth user experience
- **TypeScript support**: Full TypeScript support with proper type definitions

## Styling

The outline variant includes:

- Border color changes on focus
- Label transitions with size and position changes
- Proper z-index layering for the floating label

## Implementation Details

The variant is implemented using:

- CSS custom properties from Mantine's design system
- CSS transitions for smooth animations
- `:focus-within` and `:not(:placeholder-shown)` pseudo-selectors for state detection
- Proper integration with Mantine's theming system
