import { Menu } from '@mantine/core';
import { IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified } from '@tabler/icons-react';
import { useRichTextEditorContext } from '@mantine/tiptap';
import { useEditorState } from '@tiptap/react';
import { useTranslation } from 'react-i18next';

import { DropdownButton } from './DropdownButton';
import classes from './AlignmentDropdown.module.css';

type Alignment = 'left' | 'center' | 'right' | 'justify';

interface AlignmentOption {
  value: Alignment;
  labelKey: string;
  Icon: typeof IconAlignLeft;
}

const ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { value: 'left', labelKey: 'richTextEditor.alignLeft', Icon: IconAlignLeft },
  { value: 'center', labelKey: 'richTextEditor.alignCenter', Icon: IconAlignCenter },
  { value: 'right', labelKey: 'richTextEditor.alignRight', Icon: IconAlignRight },
  { value: 'justify', labelKey: 'richTextEditor.alignJustify', Icon: IconAlignJustified },
];

/**
 * Dropdown for selecting text alignment (left, center, right, justify).
 */
export const AlignmentDropdown = () => {
  const { t } = useTranslation();
  const { editor } = useRichTextEditorContext();

  // Subscribe to editor state changes for reactive updates
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const alignment =
        ALIGNMENT_OPTIONS.find((opt) => ctx.editor?.isActive({ textAlign: opt.value }))?.value ?? 'left';
      return { currentAlignment: alignment };
    },
  });

  const handleSelect = (alignment: Alignment) => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const currentAlignment = editorState?.currentAlignment ?? 'left';
  const CurrentIcon = ALIGNMENT_OPTIONS.find((o) => o.value === currentAlignment)?.Icon ?? IconAlignLeft;
  const isNonDefaultAlignment = currentAlignment !== 'left';

  return (
    <Menu shadow='md' withinPortal>
      <Menu.Target>
        <DropdownButton
          icon={<CurrentIcon size={16} />}
          title={t('richTextEditor.alignmentDropdown')}
          isActive={isNonDefaultAlignment}
        />
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown}>
        {ALIGNMENT_OPTIONS.map((option) => (
          <Menu.Item
            key={option.value}
            onClick={() => handleSelect(option.value)}
            leftSection={<option.Icon size={16} />}
            data-active={currentAlignment === option.value || undefined}
          >
            {t(option.labelKey)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
