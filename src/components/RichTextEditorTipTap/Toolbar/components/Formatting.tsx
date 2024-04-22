import React, { ReactNode, useMemo } from 'react';
import { Grid, MenuItem, Select } from '@mui/material';
import { useCurrentEditor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import NotesIcon from '@mui/icons-material/Notes';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import { Header1Icon, Header2Icon } from '@components/Icons/Icons.tsx';
import editorUtils from '@components/RichTextEditorTipTap/helpers.ts';

interface FormattingPresetOption {
  value: string;
  icon: ReactNode;
  setter: () => void;
}

const Formatting = () => {
  const { t } = useTranslation();
  const { editor } = useCurrentEditor();

  const clearFormatting = () => {
    editor?.chain().focus().setParagraph().run();

    if (editor?.isActive('bulletList')) {
      editor?.chain().focus().toggleBulletList().run();
    }

    if (editor?.isActive('orderedList')) {
      editor?.chain().focus().toggleOrderedList().run();
    }
  };

  const options = useMemo<FormattingPresetOption[]>(
    () => [
      {
        value: 'paragraph',
        icon: <NotesIcon fontSize='small' />,
        setter: clearFormatting,
      },
      {
        value: 'header1',
        icon: <Header1Icon fontSize='small' />,
        setter: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        value: 'header2',
        icon: <Header2Icon fontSize='small' />,
        setter: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        value: 'bulletList',
        icon: <FormatListBulletedIcon fontSize='small' />,
        setter: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        value: 'orderedList',
        icon: <FormatListNumberedIcon fontSize='small' />,
        setter: () => editor?.chain().focus().toggleOrderedList().run(),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor],
  );

  const handleSelect = () => {
    editor?.commands.unsetFontSize();
  };

  const currentValue = editorUtils.getFormatting(editor);

  return (
    <Select onChange={handleSelect} value={currentValue} className='editor-select editor-formatting'>
      {options.map(({ value, icon, setter }) => (
        <MenuItem value={value} key={value} onClick={setter}>
          <Grid gap={1} container alignItems='center'>
            {icon}
            <Grid item>{t(`textEditor.formatting.${value}`)}</Grid>
          </Grid>
        </MenuItem>
      ))}
    </Select>
  );
};

export default Formatting;
