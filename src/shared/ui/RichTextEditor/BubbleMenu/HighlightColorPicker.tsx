import { useRichTextEditorContext } from '@mantine/tiptap';
import { IconBucketDroplet } from '@tabler/icons-react';
import { useEditorState } from '@tiptap/react';
import { useTranslation } from 'react-i18next';

import { ColorPickerControl } from './ColorPickerControl';

const HIGHLIGHT_SWATCHES = [
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#ff00ff',
  '#ff0000',
  '#0000ff',
  '#fff2cc',
  '#d9ead3',
  '#d0e0e3',
  '#cfe2f3',
  '#d9d2e9',
  '#ead1dc',
];

const DEFAULT_HIGHLIGHT_COLOR = '#ffffffff';

/**
 * Color picker for text highlight in the rich text editor.
 */
export function HighlightColorPicker() {
  const { t } = useTranslation();
  const { editor } = useRichTextEditorContext();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      highlightColor: ctx.editor?.getAttributes('highlight').color as string | undefined,
    }),
  });

  const handleColorSelect = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color }).run();
  };

  const highlightColor = editorState?.highlightColor;

  return (
    <ColorPickerControl
      icon={<IconBucketDroplet size={16} />}
      title={t('richTextEditor.highlightColor')}
      swatches={HIGHLIGHT_SWATCHES}
      value={highlightColor}
      onChange={handleColorSelect}
      position='top'
      onReset={() => editor?.chain().focus().unsetHighlight().run()}
    />
  );
}
