import React, { MouseEvent, useCallback, useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import { Button, Grid, Popover } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import { useTranslation } from 'react-i18next';

const FillColor = () => {
  const { t } = useTranslation();
  const { editor } = useCurrentEditor();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
    editor?.commands.focus();
  }, [editor?.commands]);

  const getCurrentColor = () => {
    const { color } = editor?.getAttributes('highlight') || {};
    return color ?? '#ffffff';
  };

  const changeColor: ColorChangeHandler = ({ hex }) => {
    editor?.commands.setHighlight({ color: hex });
  };
  const opened = !!anchorEl;

  const reset = () => {
    editor?.commands.setHighlight({ color: 'transparent' });
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
        <FormatColorFillIcon fontSize='small' />
        {opened ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </button>
    </>
  );
};

export default FillColor;
