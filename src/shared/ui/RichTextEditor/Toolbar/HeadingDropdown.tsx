import { Menu } from '@mantine/core';
import { IconHeading, IconH1, IconH2, IconH3 } from '@tabler/icons-react';
import { useRichTextEditorContext } from '@mantine/tiptap';
import { useEditorState } from '@tiptap/react';
import { useTranslation } from 'react-i18next';

import { DropdownButton } from './DropdownButton';
import classes from './HeadingDropdown.module.css';

type HeadingLevel = 1 | 2 | 3;

interface HeadingOption {
  level: HeadingLevel | null;
  labelKey: string;
  className: string;
  Icon?: typeof IconHeading;
}

const HEADING_OPTIONS: HeadingOption[] = [
  { level: 1, labelKey: 'richTextEditor.heading1', className: classes.h1, Icon: IconH1 },
  { level: 2, labelKey: 'richTextEditor.heading2', className: classes.h2, Icon: IconH2 },
  { level: 3, labelKey: 'richTextEditor.heading3', className: classes.h3, Icon: IconH3 },
  { level: null, labelKey: 'richTextEditor.paragraph', className: classes.paragraph },
];

/**
 * Dropdown for selecting heading levels (H1, H2, H3) or paragraph.
 */
export const HeadingDropdown = () => {
  const { t } = useTranslation();
  const { editor } = useRichTextEditorContext();

  // Subscribe to editor state changes for reactive updates
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isHeadingActive: ctx.editor?.isActive('heading') ?? false,
      activeLevel: ([1, 2, 3] as const).find((level) => ctx.editor?.isActive('heading', { level })) ?? null,
    }),
  });

  const isHeadingActive = editorState?.isHeadingActive ?? false;
  const activeLevel = editorState?.activeLevel ?? null;

  const handleSelect = (level: HeadingLevel | null) => {
    if (!editor) return;

    const { state } = editor;
    const { from } = state.selection;
    const $from = state.doc.resolve(from);

    // Get the start and end positions of the current block
    const blockStart = $from.start();
    const blockEnd = $from.end();

    // Select entire block content, unset font size, then apply heading/paragraph
    const chain = editor.chain().focus().setTextSelection({ from: blockStart, to: blockEnd }).unsetFontSize();

    if (level === null) {
      chain.setParagraph();
    } else {
      chain.setHeading({ level });
    }

    // Move cursor to start of the line
    chain.setTextSelection(blockStart).run();
  };

  const isOptionActive = (level: HeadingLevel | null) => {
    if (level === null) return !isHeadingActive;
    return activeLevel === level;
  };

  const ActiveIcon = HEADING_OPTIONS.find((option) => isOptionActive(option.level))?.Icon ?? IconHeading;

  return (
    <Menu shadow='md'>
      <Menu.Target>
        <DropdownButton
          icon={<ActiveIcon size={16} />}
          title={t('richTextEditor.headingDropdown')}
          isActive={isHeadingActive}
        />
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown}>
        {HEADING_OPTIONS.map((option) => (
          <Menu.Item
            key={option.level ?? 'p'}
            onClick={() => handleSelect(option.level)}
            className={option.className}
            data-active={isOptionActive(option.level) || undefined}
          >
            {t(option.labelKey)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
