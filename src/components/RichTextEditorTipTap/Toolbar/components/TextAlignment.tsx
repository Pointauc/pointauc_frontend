import React, { ReactNode, useMemo } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import NotesIcon from '@mui/icons-material/Notes';
import { Grid, MenuItem, Select } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';

import { Header1Icon, Header2Icon } from '@components/Icons/Icons.tsx';

interface AlignmentPresetOption {
  value: string;
  icon: ReactNode;
  setter: () => void;
}

const TextAlignment = () => {
  const { editor } = useCurrentEditor();
  const options = useMemo<AlignmentPresetOption[]>(
    () => [
      {
        value: 'left',
        icon: <FormatAlignLeftIcon fontSize='small' />,
        setter: () => editor?.chain().focus().setTextAlign('left').run(),
      },
      {
        value: 'center',
        icon: <FormatAlignCenterIcon fontSize='small' />,
        setter: () => editor?.chain().focus().setTextAlign('center').run(),
      },
      {
        value: 'right',
        icon: <FormatAlignRightIcon fontSize='small' />,
        setter: () => editor?.chain().focus().setTextAlign('right').run(),
      },
      {
        value: 'justify',
        icon: <FormatAlignJustifyIcon fontSize='small' />,
        setter: () => editor?.chain().focus().setTextAlign('justify').run(),
      },
    ],
    [editor],
  );
  const getCurrentValue = () => {
    return options.find(({ value }) => editor?.isActive({ textAlign: value }))?.value ?? 'left';
  };

  return (
    <Select value={getCurrentValue()} className='editor-select'>
      {options.map(({ value, icon, setter }) => (
        <MenuItem value={value} key={value} onClick={setter}>
          <Grid container alignItems='center'>
            {icon}
          </Grid>
        </MenuItem>
      ))}
    </Select>
  );
};

export default TextAlignment;
