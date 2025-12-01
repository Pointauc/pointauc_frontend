import { ActionIcon, Divider, Group, Menu, ScrollArea, Text } from '@mantine/core';
import { useRichTextEditorContext } from '@mantine/tiptap';
import { IconChevronDown, IconTextSize } from '@tabler/icons-react';
import { useEditorState } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { useScrollIntoView } from '@mantine/hooks';

import classes from './FontSizeInput.module.css';

const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

const DEFAULT_FONT_SIZE = 16;

/** Default font sizes for heading levels (based on typical browser defaults) */
const HEADING_FONT_SIZES: Record<number, number> = {
  1: 32, // h1: 2em
  2: 24, // h2: 1.5em
  3: 20, // h3: ~1.17em
};

/**
 * Parses font size string (e.g. '1.25em', '20px') to a number in px.
 */
function parseFontSize(fontSize: string | undefined): number | undefined {
  if (!fontSize) return undefined;

  const BASE_FONT_SIZE = 16;

  if (fontSize.endsWith('em')) {
    const em = parseFloat(fontSize);
    return isNaN(em) ? undefined : Math.round(em * BASE_FONT_SIZE);
  }

  if (fontSize.endsWith('px')) {
    const px = parseFloat(fontSize);
    return isNaN(px) ? undefined : px;
  }

  return undefined;
}

/**
 * Dropdown for selecting font size from a list of options.
 */
export function FontSizeInput() {
  const { t } = useTranslation();
  const { editor } = useRichTextEditorContext();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const ed = ctx.editor;
      if (!ed) return { currentSize: undefined, headingLevel: undefined };

      const customSize = ed.getAttributes('textStyle').fontSize as string | undefined;

      // Check if current selection is in a heading
      let headingLevel: number | undefined;
      for (let level = 1; level <= 3; level++) {
        if (ed.isActive('heading', { level })) {
          headingLevel = level;
          break;
        }
      }

      return { currentSize: customSize, headingLevel };
    },
  });

  // Get the default size for current context (heading or paragraph)
  const headingLevel = editorState?.headingLevel;
  const defaultSize = headingLevel ? HEADING_FONT_SIZES[headingLevel] : DEFAULT_FONT_SIZE;

  const reserFontSize = () => {
    editor?.chain().focus().setFontSize(`${defaultSize}px`).run();
  };

  const handleSelect = (size: number) => {
    if (!editor) return;

    if (size === defaultSize) {
      // Reset to default for this element type
      reserFontSize();
    } else {
      editor.chain().focus().setFontSize(`${size}px`).run();
    }
  };

  // Determine displayed size: custom size > heading default > paragraph default
  const customSize = parseFontSize(editorState?.currentSize);
  const currentSize = customSize ?? defaultSize;

  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView({ duration: 0 });

  const handleDropdownRender = () => {
    scrollIntoView({ alignment: 'center' });
  };

  return (
    <Menu shadow='md' withinPortal>
      <Menu.Target>
        <ActionIcon
          variant='light'
          color='gray'
          size='sm'
          title={t('richTextEditor.fontSizeDropdown')}
          className={classes.trigger}
        >
          <Group gap={0} wrap='nowrap' align='center'>
            <IconTextSize size={18} />
            <Text size='xs' component='span' ml={6} className={classes.sizeLabel}>
              {currentSize}
            </Text>
            <IconChevronDown size={12} />
          </Group>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown} ref={handleDropdownRender}>
        <ScrollArea.Autosize mah={240} scrollbarSize={6} viewportRef={scrollableRef}>
          <Menu.Item key='reset' onClick={reserFontSize}>{`${defaultSize} px`}</Menu.Item>
          <Divider />
          {FONT_SIZE_OPTIONS.map((size) => (
            <Menu.Item
              key={size}
              onClick={() => handleSelect(size)}
              data-active={currentSize === size || undefined}
              ref={currentSize === size ? targetRef : undefined}
              className={classes.menuItem}
            >
              {`${size} px`}
            </Menu.Item>
          ))}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
