import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Divider, Paper } from '@mui/material';

import Formatting from '@components/RichTextEditorTipTap/Toolbar/components/Formatting.tsx';
import EditorHistory from '@components/RichTextEditorTipTap/Toolbar/components/EditorHistory.tsx';
import FontSize from '@components/RichTextEditorTipTap/Toolbar/components/FontSize.tsx';
import TextDecoration from '@components/RichTextEditorTipTap/Toolbar/components/TextDecoration.tsx';

const Toolbar = () => {
  const { editor } = useCurrentEditor();

  return (
    <Paper className='editor-menu' elevation={0}>
      <EditorHistory />
      <Divider orientation='vertical' />
      <Formatting />
      <Divider orientation='vertical' />
      <FontSize />
      <Divider orientation='vertical' />
      <TextDecoration />
    </Paper>
  );
};

export default Toolbar;
