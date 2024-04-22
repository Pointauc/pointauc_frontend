import React from 'react';
import { IconButton } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import { useCurrentEditor } from '@tiptap/react';

import TextColor from '@components/RichTextEditorTipTap/Toolbar/components/TextColor.tsx';
import FillColor from '@components/RichTextEditorTipTap/Toolbar/components/FillColor.tsx';
import TextAlignment from '@components/RichTextEditorTipTap/Toolbar/components/TextAlignment.tsx';

const TextDecoration = () => {
  const { editor } = useCurrentEditor();

  return (
    <>
      <IconButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        disabled={!editor?.can().chain().focus().toggleBold().run()}
        className={editor?.isActive('bold') ? 'active' : ''}
      >
        <FormatBoldIcon fontSize='small' />
      </IconButton>
      <IconButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        disabled={!editor?.can().chain().focus().toggleItalic().run()}
        className={editor?.isActive('italic') ? 'active' : ''}
      >
        <FormatItalicIcon fontSize='small' />
      </IconButton>
      <IconButton
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        disabled={!editor?.can().chain().focus().toggleUnderline().run()}
        className={editor?.isActive('underline') ? 'active' : ''}
      >
        <FormatUnderlinedIcon fontSize='small' />
      </IconButton>
      <TextColor />
      <FillColor />
      <TextAlignment />
    </>
  );
};

export default TextDecoration;
