import React from 'react';
import { IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useCurrentEditor } from '@tiptap/react';

const EditorHistory = () => {
  const { editor } = useCurrentEditor();
  return (
    <>
      <IconButton onClick={() => editor?.chain().undo().run()} disabled={!editor?.can().undo()}>
        <UndoIcon fontSize='small' />
      </IconButton>
      <IconButton onClick={() => editor?.chain().redo().run()} disabled={!editor?.can().redo()}>
        <RedoIcon fontSize='small' />
      </IconButton>
    </>
  );
};

export default EditorHistory;
