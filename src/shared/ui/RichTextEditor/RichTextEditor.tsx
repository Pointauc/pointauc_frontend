import { RichTextEditor } from '@mantine/tiptap';

import { EditorBubbleMenu } from './BubbleMenu';
import { useRichTextEditor } from './hooks/useRichTextEditor';
import classes from './RichTextEditor.module.css';
import { Toolbar } from './Toolbar/Toolbar';

import type { JSONContent } from '@tiptap/react';

import '@mantine/tiptap/styles.css';

export interface RichTextEditorProps {
  /** Initial content in JSONContent format */
  content?: JSONContent;
  /** Callback fired when content changes */
  onChange?: (content: JSONContent) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Minimum height of the editor content area */
  minHeight?: number | string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Whether the toolbar is visible */
  isToolbarVisible?: boolean;
  /** Makes the toolbar sticky at the top when scrolling */
  stickyToolbar?: boolean;
  /** Offset from top when sticky (e.g., for fixed headers) */
  stickyOffset?: number | string;
  /** Additional class name for the root element */
  className?: string;
  extraControls?: React.ReactNode;
}

/**
 * Rich text editor component built on TipTap and Mantine.
 * Provides a toolbar with structural controls and a bubble menu for text formatting.
 */
export const RichTextEditorComponent = ({
  content,
  onChange,
  placeholder,
  minHeight = 200,
  editable = true,
  isToolbarVisible = true,
  stickyToolbar = false,
  stickyOffset,
  className,
  extraControls,
}: RichTextEditorProps) => {
  'use no memo';
  const editor = useRichTextEditor({
    content,
    onChange,
    placeholder,
    editable,
  });

  return (
    <RichTextEditor
      variant='subtle'
      editor={editor}
      className={`${classes.editor} ${className ?? ''}`}
      classNames={{ control: classes.control, content: classes.content }}
    >
      {isToolbarVisible && <Toolbar sticky={stickyToolbar} stickyOffset={stickyOffset} extraControls={extraControls} />}

      {editable && <EditorBubbleMenu />}

      <RichTextEditor.Content style={{ minHeight }} />
    </RichTextEditor>
  );
};
