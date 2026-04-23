import { ActionIcon, Badge, Box, Combobox, Group, InputBase, Text, TextInput, useCombobox } from '@mantine/core';
import { IconArrowBackUp, IconCheck, IconChevronDown, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export interface EditableDropdownItem {
  value: string;
  label: string;
}

interface EditableDropdownProps {
  options: EditableDropdownItem[];
  value: string | null;
  disabled?: boolean;
  placeholder: string;
  addOptionLabel: string;
  selectedLabel?: string;
  editOptionLabel: string;
  deleteOptionLabel: string;
  submitLabel: string;
  revertLabel: string;
  onSelectOption: (value: string) => void;
  onAddOption: () => void;
  onRenameOption: (value: string, label: string) => void;
  onDeleteOption: (value: string) => void;
  canDeleteOption?: (option: EditableDropdownItem) => boolean;
}

const ADD_OPTION_VALUE = '__add_new_option__';

const EditableDropdown = ({
  options,
  value,
  disabled = false,
  placeholder,
  addOptionLabel,
  selectedLabel,
  editOptionLabel,
  deleteOptionLabel,
  submitLabel,
  revertLabel,
  onSelectOption,
  onAddOption,
  onRenameOption,
  onDeleteOption,
  canDeleteOption,
}: EditableDropdownProps) => {
  const [editingOptionValue, setEditingOptionValue] = useState<string | null>(null);
  const [draftOptionLabel, setDraftOptionLabel] = useState('');

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setEditingOptionValue(null);
      setDraftOptionLabel('');
    },
  });

  const selectedOption = value ? options.find((option) => option.value === value) : undefined;
  const checkCanDeleteOption = (option: EditableDropdownItem) => {
    if (canDeleteOption) {
      return canDeleteOption(option);
    }

    return options.length > 1 && option.value !== value;
  };

  const handleStartEditing = (option: EditableDropdownItem) => {
    if (disabled) {
      return;
    }

    setEditingOptionValue(option.value);
    setDraftOptionLabel(option.label);
  };

  const handleCancelEditing = () => {
    setEditingOptionValue(null);
    setDraftOptionLabel('');
  };

  const handleSubmitEditing = (optionValue: string) => {
    if (disabled) {
      return;
    }

    const nextOptionLabel = draftOptionLabel.trim();

    if (!nextOptionLabel) {
      handleCancelEditing();
      return;
    }

    onRenameOption(optionValue, nextOptionLabel);
    handleCancelEditing();
  };

  const handleDeleteOption = (optionValue: string) => {
    if (disabled) {
      return;
    }

    onDeleteOption(optionValue);
  };

  const handleOptionSubmit = (optionValue: string) => {
    if (disabled) {
      return;
    }

    if (optionValue === ADD_OPTION_VALUE) {
      onAddOption();
    } else {
      onSelectOption(optionValue);
    }

    combobox.closeDropdown();
  };

  return (
    <Combobox store={combobox} onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target>
        <InputBase
          component='button'
          type='button'
          disabled={disabled}
          pointer={!disabled}
          rightSection={<IconChevronDown size={18} />}
          rightSectionPointerEvents='none'
          size='sm'
          styles={{
            input: {
              fontSize: 'var(--mantine-font-size-sm)',
            },
          }}
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedOption ? (
            <Text truncate size='sm'>
              {selectedOption.label}
            </Text>
          ) : (
            <Text c='dimmed' size='sm'>
              {placeholder}
            </Text>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <Combobox.Option value={ADD_OPTION_VALUE}>
            <Group gap='xs' wrap='nowrap'>
              <IconPlus size={18} />
              <Text fw={500} size='sm'>
                {addOptionLabel}
              </Text>
            </Group>
          </Combobox.Option>

          {options.map((option) => {
            const isSelectedOption = option.value === value;
            const isEditingOption = editingOptionValue === option.value;

            if (isEditingOption) {
              return (
                <Box key={option.value} px='sm' py={8}>
                  <Group gap='xs' wrap='nowrap' align='center'>
                    <TextInput
                      autoFocus
                      flex={1}
                      size='sm'
                      value={draftOptionLabel}
                      onChange={(event) => setDraftOptionLabel(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleSubmitEditing(option.value);
                        }

                        if (event.key === 'Escape') {
                          event.preventDefault();
                          handleCancelEditing();
                        }
                      }}
                    />
                    {selectedLabel && isSelectedOption ? (
                      <Badge size='xs' variant='light'>
                        {selectedLabel}
                      </Badge>
                    ) : null}
                    <ActionIcon
                      size='md'
                      variant='subtle'
                      disabled={disabled}
                      onClick={() => handleSubmitEditing(option.value)}
                      aria-label={submitLabel}
                    >
                      <IconCheck size={18} />
                    </ActionIcon>
                    <ActionIcon
                      size='md'
                      variant='subtle'
                      disabled={disabled}
                      onClick={handleCancelEditing}
                      aria-label={revertLabel}
                    >
                      <IconArrowBackUp size={18} />
                    </ActionIcon>
                  </Group>
                </Box>
              );
            }

            return (
              <Combobox.Option key={option.value} value={option.value}>
                <Group justify='space-between' wrap='nowrap' gap='xs'>
                  <Group gap='xs' wrap='nowrap' miw={0} style={{ flex: 1 }}>
                    <Text fw={isSelectedOption ? 700 : 400} size='sm' truncate>
                      {option.label}
                    </Text>
                    {selectedLabel && isSelectedOption ? (
                      <Badge size='xs' variant='light'>
                        {selectedLabel}
                      </Badge>
                    ) : null}
                  </Group>

                  <Group gap={4} wrap='nowrap'>
                    <ActionIcon
                      size='md'
                      variant='subtle'
                      disabled={disabled}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleStartEditing(option);
                      }}
                      aria-label={editOptionLabel}
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                    <ActionIcon
                      size='md'
                      variant='subtle'
                      color='red'
                      disabled={disabled || !checkCanDeleteOption(option)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDeleteOption(option.value);
                      }}
                      aria-label={deleteOptionLabel}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Combobox.Option>
            );
          })}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default EditableDropdown;
