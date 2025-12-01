import { useState, useCallback, Ref } from 'react';
import { Combobox, useCombobox, InputBase, Group, Text, Box, ActionIcon } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { EditableSelectOption, EditableSelectSize } from './types';
import OptionItem from './components/OptionItem';
import EditModeInput from './components/EditModeInput';
import AddOptionInput from './components/AddOptionInput';
import classes from './EditableSelect.module.css';

export type { EditableSelectOption, EditableSelectSize };

export interface EditableSelectProps {
  /** Currently selected option value */
  value: string;
  /** Callback fired when selection changes */
  onChange: (value: string) => void;
  /** List of available options */
  options: EditableSelectOption[];
  /** Callback fired when an option label is renamed */
  onOptionRename: (value: string, newLabel: string) => void;
  /** Callback fired when a new option is added. Returns the new option to be added. */
  onOptionAdd: (label?: string) => void;
  /** Callback fired when an option is deleted */
  onOptionDelete: (value: string) => void;
  /** Label displayed above the input */
  label?: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Component size */
  size?: EditableSelectSize;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Ref to the dropdown */
  dropdownRef?: Ref<HTMLDivElement>;
}

/**
 * A versatile select component that allows users to:
 * - Select from a dropdown list of options
 * - Edit the label of the currently selected option inline
 * - Remove options from the list (minimum one option must remain)
 * - Add new options to the list
 *
 * Built on top of Mantine's Combobox for consistent styling and accessibility.
 */
function EditableSelect({
  value,
  onChange,
  options,
  onOptionRename,
  onOptionAdd,
  onOptionDelete,
  label,
  placeholder,
  size = 'md',
  dropdownRef,
  disabled = false,
}: EditableSelectProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setIsAddingNew(false);
      setNewOptionValue('');
    },
  });

  const selectedOption = options.find((opt) => opt.value === value);
  const canDelete = options.length > 1;

  const handleStartEdit = () => {
    if (selectedOption) {
      setEditValue(selectedOption.label);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleConfirmEdit = () => {
    const trimmedValue = editValue.trim();
    if (!trimmedValue || !selectedOption) {
      handleCancelEdit();
      return;
    }

    onOptionRename(value, trimmedValue);
    setIsEditing(false);
    setEditValue('');
  };

  const handleDeleteOption = (optionValue: string) => {
    if (!canDelete) return;

    onOptionDelete(optionValue);

    if (value === optionValue) {
      const remainingOption = options.find((opt) => opt.value !== optionValue);
      if (remainingOption) {
        onChange(remainingOption.value);
      }
    }
  };

  const handleStartAddNew = () => {
    setIsAddingNew(true);
  };

  const handleCancelAddNew = () => {
    setIsAddingNew(false);
    setNewOptionValue('');
  };

  const handleConfirmAddNew = () => {
    const trimmedValue = newOptionValue.trim();

    onOptionAdd(trimmedValue);
    setIsAddingNew(false);
    setNewOptionValue('');
    combobox.closeDropdown();
  };

  if (isEditing) {
    return (
      <EditModeInput
        value={editValue}
        onChange={setEditValue}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
        size={size}
        label={label}
      />
    );
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Box w='100%'>
          {label && (
            <Text size={size} fw={500} mb={4}>
              {label}
            </Text>
          )}
          <Group gap={4} wrap='nowrap'>
            <InputBase
              component='button'
              type='button'
              pointer
              rightSection={<Combobox.Chevron />}
              rightSectionPointerEvents='none'
              onClick={() => combobox.toggleDropdown()}
              size={size}
              disabled={disabled}
              className={classes.selectInput}
            >
              {selectedOption?.label || <Text c='dimmed'>{placeholder ?? t('editableSelect.placeholder')}</Text>}
            </InputBase>
            <ActionIcon
              size={`input-${size}`}
              variant='subtle'
              onClick={handleStartEdit}
              disabled={disabled || !selectedOption}
              title={t('editableSelect.editOption')}
            >
              <IconPencil />
            </ActionIcon>
          </Group>
        </Box>
      </Combobox.Target>

      <Combobox.Dropdown ref={dropdownRef}>
        <Combobox.Options>
          {options.map((option) => (
            <OptionItem
              key={option.value}
              selectedValue={value}
              option={option}
              size={size}
              canDelete={canDelete}
              onDelete={handleDeleteOption}
            />
          ))}
        </Combobox.Options>

        <Combobox.Footer className={classes.footer}>
          <AddOptionInput
            isAdding={isAddingNew}
            value={newOptionValue}
            onChange={setNewOptionValue}
            onStartAdd={handleStartAddNew}
            onConfirm={handleConfirmAddNew}
            onCancel={handleCancelAddNew}
          />
        </Combobox.Footer>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default EditableSelect;
