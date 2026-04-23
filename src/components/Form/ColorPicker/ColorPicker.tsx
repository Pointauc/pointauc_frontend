import { Button, Popover } from '@mantine/core';
import { useThrottledCallback } from '@tanstack/react-pacer';
import SketchPicker, { SketchProps } from '@uiw/react-color-sketch';
import { FC, useCallback } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange, onBlur }) => {
  const handleColorChange = useCallback<Required<SketchProps>['onChange']>(
    ({ hex }) => {
      onChange(hex);
      onBlur?.();
    },
    [onChange, onBlur],
  );

  const colorChangeThrottled = useThrottledCallback(handleColorChange, { wait: 250, trailing: true, leading: true });

  return (
    <>
      <Popover position='top'>
        <Popover.Target>
          <Button
            style={{
              width: 36,
              height: 36,
              backgroundColor: value,
              padding: 0,
              border: '3px solid #eee',
              borderRadius: 5,
            }}
          />
        </Popover.Target>
        <Popover.Dropdown p={0} bd='none' bg='transparent'>
          <SketchPicker color={value} onChange={colorChangeThrottled} disableAlpha />
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

export default ColorPicker;
