# RichTextEditor

A compact rich text editor built on top of [Mantine TipTap](https://mantine.dev/x/tiptap/) for editing auction rules displayed to viewers.

## Usage

```tsx
import { RichTextEditor } from '@shared/ui/RichTextEditor/RichTextEditor';
import type { JSONContent } from '@tiptap/react';

function MyComponent() {
  const [content, setContent] = useState<JSONContent>(initialContent);

  return <RichTextEditor content={content} onChange={setContent} minHeight={200} placeholder='Enter your rules...' />;
}
```

## Props

| Prop               | Type                             | Default | Description                   |
| ------------------ | -------------------------------- | ------- | ----------------------------- |
| `content`          | `JSONContent`                    | —       | Initial editor content        |
| `onChange`         | `(content: JSONContent) => void` | —       | Content change callback       |
| `placeholder`      | `string`                         | —       | Placeholder text              |
| `minHeight`        | `number \| string`               | `200`   | Minimum content area height   |
| `editable`         | `boolean`                        | `true`  | Enable/disable editing        |
| `isToolbarVisible` | `boolean`                        | `true`  | Show/hide the toolbar         |
| `stickyToolbar`    | `boolean`                        | `false` | Sticky toolbar on scroll      |
| `stickyOffset`     | `number \| string`               | —       | Top offset for sticky toolbar |
| `className`        | `string`                         | —       | Additional CSS class          |

## Available Tools

| Tool             | Type     | Description                    |
| ---------------- | -------- | ------------------------------ |
| Undo/Redo        | Buttons  | History navigation             |
| Bold             | Button   | Bold text (`Ctrl+B`)           |
| Italic           | Button   | Italic text (`Ctrl+I`)         |
| Underline        | Button   | Underline text (`Ctrl+U`)      |
| Strikethrough    | Button   | Strikethrough text             |
| Heading          | Dropdown | H1, H2, H3, Paragraph          |
| Font Size        | Dropdown | Small, Normal, Large, XL       |
| Bullet List      | Button   | Unordered list                 |
| Ordered List     | Button   | Numbered list                  |
| Alignment        | Dropdown | Left, Center, Right, Justify   |
| Text Color       | Dropdown | Set text color from palette    |
| Highlight        | Dropdown | Set background highlight color |
| Clear Formatting | Button   | Remove all formatting          |

## Extensions

The editor uses the following TipTap extensions:

- StarterKit (basic formatting, lists, history)
- Link (hyperlinks)
- Underline
- TextAlign
- TextStyle + Color (text color)
- Highlight (background color)
