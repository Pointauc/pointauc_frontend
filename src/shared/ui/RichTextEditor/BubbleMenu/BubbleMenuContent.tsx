import { Divider, Group } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';

import { FontSizeInput } from './FontSizeInput';
import { HighlightColorPicker } from './HighlightColorPicker';
import { TextColorPicker } from './TextColorPicker';
import classes from './BubbleMenuContent.module.css';

/**
 * Content of the bubble menu with formatting controls.
 */
export function BubbleMenuContent() {
  return (
    <Group gap='xs' wrap='nowrap' className={classes.container}>
      {/* Formatting controls */}
      <RichTextEditor.ControlsGroup variant='default'>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
        <RichTextEditor.Strikethrough />
      </RichTextEditor.ControlsGroup>

      <Divider orientation='vertical' />

      <FontSizeInput />

      <Divider orientation='vertical' />

      <TextColorPicker />

      <HighlightColorPicker />

      <Divider orientation='vertical' />

      <RichTextEditor.ControlsGroup>
        <RichTextEditor.ClearFormatting />
      </RichTextEditor.ControlsGroup>
    </Group>
  );
}
