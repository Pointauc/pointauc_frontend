import React, { MouseEvent, useCallback, useState } from 'react';
import { Popover } from '@mui/material';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCurrentEditor } from '@tiptap/react';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const TextColor = () => {
  const { editor } = useCurrentEditor();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const getCurrentColor = () => {
    const { color } = editor?.getAttributes('textStyle') || {};
    return color ?? '#ffffff';
  };

  const changeColor: ColorChangeHandler = ({ hex }) => {
    editor?.chain().focus().setColor(hex).run();
  };
  const opened = !!anchorEl;

  return (
    <>
      <Popover
        open={opened}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handleClose}
      >
        <SketchPicker color={getCurrentColor()} onChange={changeColor} />
      </Popover>
      <button className='editor-button editor-icon-select' onClick={handleOpen}>
        <FormatColorTextIcon fontSize='small' />
        {opened ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </button>
    </>
  );
};

export default TextColor;
