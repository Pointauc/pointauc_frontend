import { useRichTextEditorContext } from '@mantine/tiptap';
import { IconLetterA } from '@tabler/icons-react';
import { useEditorState } from '@tiptap/react';
import { useTranslation } from 'react-i18next';

import { ColorPickerControl } from './ColorPickerControl';

const TEXT_COLOR_SWATCHES = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#ffffff',
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#9900ff',
];

const DEFAULT_TEXT_COLOR = 'var(--mantine-color-text)';

/**
 * Color picker for text color in the rich text editor.
 */
export function TextColorPicker() {
  const { t } = useTranslation();
  const { editor } = useRichTextEditorContext();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      textColor: ctx.editor?.getAttributes('textStyle').color as string | undefined,
    }),
  });

  const handleColorSelect = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  };

  return (
    <ColorPickerControl
      icon={<IconLetterA size={16} />}
      title={t('richTextEditor.textColor')}
      swatches={TEXT_COLOR_SWATCHES}
      value={editorState?.textColor}
      onChange={handleColorSelect}
      colorIndicator={editorState?.textColor ?? DEFAULT_TEXT_COLOR}
      onReset={() => editor?.chain().focus().unsetColor().run()}
    />
  );
}
