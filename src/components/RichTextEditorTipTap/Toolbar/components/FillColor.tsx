import React, { MouseEvent, useCallback, useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import { Popover } from '@mui/material';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';

const FillColor = () => {
  const { editor } = useCurrentEditor();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  const getCurrentColor = () => {
    const { color } = editor?.getAttributes('highlight') || {};
    return color ?? '#ffffff';
  };

  const changeColor: ColorChangeHandler = ({ hex }) => {
    editor?.commands.setHighlight({ color: hex });
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
        <FormatColorFillIcon fontSize='small' />
        {opened ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </button>
    </>
  );
};

export default FillColor;
