import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export interface UseRichTextEditorOptions {
  /** Initial content in JSONContent format */
  content?: JSONContent;
  /** Callback fired when content changes */
  onChange?: (content: JSONContent) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
}

/**
 * Hook that creates and configures a TipTap editor instance with all necessary extensions.
 * Handles content updates and provides a fully configured editor for the RichTextEditor component.
 */
export function useRichTextEditor({ content, onChange, placeholder, editable = true }: UseRichTextEditorOptions) {
  const editor = useEditor(
    {
      // Required for React 19 compatibility
      immediatelyRender: true,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          link: false,
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyle,
        FontSize,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        Placeholder.configure({
          placeholder: placeholder ?? '',
        }),
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getJSON());
      },
    },
    [content],
  );

  return editor;
}
