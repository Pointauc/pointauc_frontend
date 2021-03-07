import React, { FC, MouseEvent, useCallback, useState } from 'react';
import { ButtonBase, Popover } from '@material-ui/core';
import { ColorResult, SketchPicker } from 'react-color';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleColorChange = useCallback(({ hex }: ColorResult) => onChange(hex), [onChange]);

  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        elevation={10}
        onClose={handleClose}
      >
        <SketchPicker color={value} onChange={handleColorChange} />
      </Popover>
      <ButtonBase
        style={{
          width: 34,
          height: 34,
          backgroundColor: value,
          padding: 0,
          border: '3px solid #eee',
          borderRadius: 5,
        }}
        onClick={handleOpen}
      />
    </>
  );
};

export default ColorPicker;
