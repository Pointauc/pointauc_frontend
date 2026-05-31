import { Portal } from '@mantine/core';
import { useRichTextEditorContext } from '@mantine/tiptap';
import { BubbleMenu } from '@tiptap/react/menus';
import { useContext, useState } from 'react';

import { PortalContext } from '@App/storage/portalContextData';

import { BubbleMenuContent } from './BubbleMenuContent';
import classes from './EditorBubbleMenu.module.css';

/**
 * Bubble menu that appears when text is selected.
 * Contains formatting controls, text color, highlight color, and font size.
 */
export function EditorBubbleMenu() {
  const { editor } = useRichTextEditorContext();
  const { portalRoot } = useContext(PortalContext);
  const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);
  if (!editor) return null;

  return (
    <>
      <Portal target={portalRoot ?? undefined}>
        <div className={classes.menu} ref={setMenuRef} />
      </Portal>
      {menuRef && (
        <BubbleMenu editor={editor} appendTo={menuRef ?? undefined} options={{ placement: 'bottom' }}>
          <BubbleMenuContent />
        </BubbleMenu>
      )}
    </>
  );
}
