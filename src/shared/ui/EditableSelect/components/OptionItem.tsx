import { Combobox, Group, Text, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { EditableSelectOption, EditableSelectSize } from '../types';
import classes from '../EditableSelect.module.css';

interface OptionItemProps {
  option: EditableSelectOption;
  size: EditableSelectSize;
  canDelete: boolean;
  onDelete: (value: string) => void;
}

function OptionItem({ option, size, canDelete, onDelete }: OptionItemProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(option.value);
  };

  return (
    <Combobox.Option value={option.value} className={classes.option}>
      <Group justify='space-between' wrap='nowrap' gap='xs'>
        <Text size={size} truncate className={classes.optionLabel}>
          {option.label}
        </Text>
        {canDelete && (
          <ActionIcon
            size='sm'
            variant='subtle'
            color='red'
            onClick={handleDeleteClick}
            className={classes.deleteButton}
          >
            <IconTrash />
          </ActionIcon>
        )}
      </Group>
    </Combobox.Option>
  );
}

export default OptionItem;
