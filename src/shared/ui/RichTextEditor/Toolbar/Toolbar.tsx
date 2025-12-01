import { RichTextEditor } from '@mantine/tiptap';
import { Divider, Group } from '@mantine/core';

import { AlignmentDropdown } from './AlignmentDropdown';
import { HeadingDropdown } from './HeadingDropdown';
import { HistoryControls } from './HistoryControls';
import { ListControls } from './ListControls';
import classes from './Toolbar.module.css';
import ExtraControls from './ExtraControls';

export interface ToolbarProps {
  /** Makes the toolbar sticky at the top when scrolling */
  sticky?: boolean;
  /** Offset from top when sticky (e.g., for fixed headers) */
  stickyOffset?: number | string;
  /** Additional controls to render in the toolbar */
  extraControls?: React.ReactNode;
}

/**
 * Compact toolbar with structural controls. Formatting controls are in the bubble menu.
 */
export const Toolbar = ({ sticky = false, stickyOffset, extraControls }: ToolbarProps) => {
  return (
    <RichTextEditor.Toolbar sticky={sticky} stickyOffset={stickyOffset} className={classes.toolbar}>
      <Group justify='space-between' w='100%'>
        <Group gap='xs'>
          <HistoryControls />

          <Divider orientation='vertical' />

          <RichTextEditor.ControlsGroup>
            <HeadingDropdown />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <AlignmentDropdown />
          </RichTextEditor.ControlsGroup>

          <Divider orientation='vertical' />

          <ListControls />
        </Group>
        {extraControls && <ExtraControls>{extraControls}</ExtraControls>}
      </Group>
    </RichTextEditor.Toolbar>
  );
};
