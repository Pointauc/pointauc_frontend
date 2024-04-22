import { Editor } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import StarterKit from '@tiptap/starter-kit';

import { HighlightExtended } from '@components/RichTextEditorTipTap/HighlightExtended.ts';

export type Formatting = 'paragraph' | 'header1' | 'header2' | 'bulletList' | 'orderedList';

const getFormatting = (editor: Editor | null): Formatting => {
  const valueMap: Record<Formatting, () => boolean | undefined> = {
    bulletList: () => editor?.isActive('bulletList'),
    orderedList: () => editor?.isActive('orderedList'),
    paragraph: () => editor?.isActive('paragraph'),
    header1: () => editor?.isActive('heading', { level: 1 }),
    header2: () => editor?.isActive('heading', { level: 2 }),
  };

  return (Object.entries(valueMap).find(([, callback]) => callback())?.[0] as Formatting) ?? 'paragraph';
};

const extensions = [
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Underline.configure({
    HTMLAttributes: {
      class: 'my-custom-class',
    },
  }),
  HighlightExtended.configure({ multicolor: true, HTMLAttributes: { class: 'highlight' } }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] } as any),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];

const editorUtils = {
  getFormatting,
  extensions,
};

export default editorUtils;
