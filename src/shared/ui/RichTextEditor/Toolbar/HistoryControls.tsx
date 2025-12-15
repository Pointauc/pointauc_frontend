import { RichTextEditor } from '@mantine/tiptap';

/**
 * Undo/Redo controls for the editor toolbar.
 */
export const HistoryControls = () => {
  return (
    <RichTextEditor.ControlsGroup variant='default'>
      <RichTextEditor.Undo />
      <RichTextEditor.Redo />
    </RichTextEditor.ControlsGroup>
  );
};
