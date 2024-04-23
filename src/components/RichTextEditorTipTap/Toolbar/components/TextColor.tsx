import React, { MouseEvent, useCallback, useState } from 'react';
import { Button, Grid, Popover } from '@mui/material';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCurrentEditor } from '@tiptap/react';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useTranslation } from 'react-i18next';

const TextColor = () => {
  const { t } = useTranslation();
  const { editor } = useCurrentEditor();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
    editor?.commands.focus();
  }, [editor?.commands]);
  const getCurrentColor = () => {
    const { color } = editor?.getAttributes('textStyle') || {};
    return color ?? '#ffffff';
  };

  const changeColor: ColorChangeHandler = ({ hex }) => {
    editor?.commands.setColor(hex);
  };
  const opened = !!anchorEl;

  const reset = () => {
    editor?.commands.unsetColor();
    handleClose();
  };

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
        <Grid container direction='column'>
          <SketchPicker color={getCurrentColor()} onChange={changeColor} />
          <div style={{ padding: 8 }}>
            <Button variant='outlined' fullWidth onClick={reset}>
              {t('common.reset')}
            </Button>
          </div>
        </Grid>
      </Popover>
      <button className='editor-button editor-icon-select' onClick={handleOpen}>
        <FormatColorTextIcon fontSize='small' />
        {opened ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </button>
    </>
  );
};

export default TextColor;
