import { FC, MouseEvent, useCallback, useState } from 'react';
import { Button, Popover } from '@mantine/core';
import SketchPicker, { SketchProps } from '@uiw/react-color-sketch';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange, onBlur }) => {
  const handleColorChange = useCallback<Required<SketchProps>['onChange']>(
    ({ hex }) => {
      onChange(hex);
    },
    [onChange],
  );

  return (
    <>
      <Popover position='top'>
        <Popover.Target>
          <Button
            style={{
              width: 34,
              height: 34,
              backgroundColor: value,
              padding: 0,
              border: '3px solid #eee',
              borderRadius: 5,
            }}
          />
        </Popover.Target>
        <Popover.Dropdown p={0} bd='none' bg='transparent'>
          <SketchPicker color={value} onChange={handleColorChange} disableAlpha />
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

export default ColorPicker;
