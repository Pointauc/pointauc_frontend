import { ActionIcon, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { forwardRef, ReactNode } from 'react';

import classes from './DropdownButton.module.css';

export interface DropdownButtonProps {
  /** Icon to display */
  icon: ReactNode;
  /** Tooltip/title for the button */
  title: string;
  /** Whether the button represents an active state */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * A button styled for dropdown menus with a chevron indicator.
 */
export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(function DropdownButton(
  { icon, title, isActive, onClick },
  ref,
) {
  return (
    <ActionIcon
      ref={ref}
      variant={isActive ? 'light' : 'light'}
      color={isActive ? 'primary' : 'gray'}
      size='md'
      title={title}
      onClick={onClick}
      className={classes.button}
    >
      <Group gap={2} wrap='nowrap'>
        {icon}
        <IconChevronDown size={12} />
      </Group>
    </ActionIcon>
  );
});
