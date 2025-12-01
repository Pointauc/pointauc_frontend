import { ReactNode, useState } from 'react';
import { ActionIcon, Box, Button, ColorPicker, Group, Popover, Stack, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { EditorActionIcon } from './EditorActionIcon';
import classes from './TextColorPicker.module.css';

interface ColorPickerControlProps {
  icon: ReactNode;
  title: string;
  swatches: string[];
  value?: string;
  onChange: (color: string) => void;
  colorIndicator?: string;
  isActive?: boolean;
  position?: 'top' | 'bottom';
  onReset?: () => void;
}

/**
 * Reusable color picker control with popover for the rich text editor.
 */
export function ColorPickerControl({
  icon,
  title,
  swatches,
  value,
  onChange,
  colorIndicator = value,
  isActive,
  position = 'top',
  onReset,
}: ColorPickerControlProps) {
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const handleReset = () => {
    onReset?.();
    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position={position}
      shadow='md'
      withinPortal={false}
      closeOnClickOutside
      withArrow
    >
      <Popover.Target>
        <EditorActionIcon
          icon={icon}
          title={title}
          colorIndicator={colorIndicator}
          isActive={isActive ?? opened}
          onClick={() => setOpened((prev) => !prev)}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap='xs'>
          <ColorPicker
            format='hex'
            value={value}
            onChange={handleColorChange}
            swatches={swatches}
            className={classes.colorPicker}
          />
          {onReset && (
            <Button variant='subtle' color='gray' size='sx' onClick={handleReset} disabled={!value}>
              {t('common.reset')}
            </Button>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
