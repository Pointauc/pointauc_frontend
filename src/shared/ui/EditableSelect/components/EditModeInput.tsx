import { useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Group, TextInput, ActionIcon, Text, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { EditableSelectSize } from '../types';
import classes from '../EditableSelect.module.css';

interface EditModeInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  size: EditableSelectSize;
  label?: string;
}

function EditModeInput({ value, onChange, onConfirm, onCancel, size, label }: EditModeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onConfirm, onCancel],
  );

  return (
    <Box w='100%'>
      {label && (
        <Text size={size} fw={500} mb={4}>
          {label}
        </Text>
      )}
      <Group gap='xs' wrap='nowrap'>
        <TextInput
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          size={size}
          className={classes.editInput}
          flex={1}
        />
        <ActionIcon size={`input-${size}`} variant='filled' color='green' onClick={onConfirm}>
          <IconCheck />
        </ActionIcon>
        <ActionIcon size={`input-${size}`} variant='filled' color='gray' onClick={onCancel}>
          <IconX />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default EditModeInput;
