import { RichTextEditor } from '@mantine/tiptap';

/**
 * List controls: Bullet list and Ordered list.
 */
export const ListControls = () => {
  return (
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.BulletList />
      <RichTextEditor.OrderedList />
    </RichTextEditor.ControlsGroup>
  );
};
