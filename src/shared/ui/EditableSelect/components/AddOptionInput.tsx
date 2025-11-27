import { useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Group, TextInput, ActionIcon } from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import classes from '../EditableSelect.module.css';

interface AddOptionInputProps {
  isAdding: boolean;
  value: string;
  onChange: (value: string) => void;
  onStartAdd: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function AddOptionInput({ isAdding, value, onChange, onStartAdd, onConfirm, onCancel }: AddOptionInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onConfirm, onCancel],
  );

  if (!isAdding) {
    return (
      <ActionIcon
        size='input-sm'
        variant='light'
        onClick={onStartAdd}
        className={classes.addButton}
        title={t('editableSelect.addOption')}
      >
        <IconPlus />
      </ActionIcon>
    );
  }

  return (
    <Group gap='xs' wrap='nowrap'>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        size='sm'
        placeholder={t('editableSelect.newOptionPlaceholder')}
        className={classes.newOptionInput}
      />
      <ActionIcon size='input-sm' variant='filled' color='green' onClick={onConfirm}>
        <IconCheck />
      </ActionIcon>
      <ActionIcon size='input-sm' variant='filled' color='gray' onClick={onCancel}>
        <IconX />
      </ActionIcon>
    </Group>
  );
}

export default AddOptionInput;
