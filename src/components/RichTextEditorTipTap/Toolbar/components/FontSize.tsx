import React from 'react';
import { IconButton, OutlinedInput } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCurrentEditor } from '@tiptap/react';

import editorUtils, { Formatting } from '@components/RichTextEditorTipTap/helpers.ts';
import './FontSize.scss';

const defaultFontSizes: Record<Formatting, number> = {
  paragraph: 18,
  header1: 32,
  header2: 26,
  bulletList: 18,
  orderedList: 18,
};

const FontSize = () => {
  const { editor } = useCurrentEditor();

  const getCurrentValue = () => {
    const { fontSize } = editor?.getAttributes('highlight') || {};
    return fontSize ? Number(fontSize) : defaultFontSizes[editorUtils.getFormatting(editor)];
  };
  const value = getCurrentValue();

  const changeFontSize = (diff: number) => {
    editor
      ?.chain()
      .focus()
      .setFontSize((value + diff).toString())
      .run();
  };

  return (
    <div className='editor-font-size'>
      <IconButton onClick={() => changeFontSize(-2)}>
        <RemoveIcon fontSize='small' />
      </IconButton>
      <OutlinedInput value={value} type='number' onChange={(e) => editor?.commands.setFontSize(e.target.value)} />
      <IconButton onClick={() => changeFontSize(2)}>
        <AddIcon fontSize='small' />
      </IconButton>
    </div>
  );
};

export default FontSize;
