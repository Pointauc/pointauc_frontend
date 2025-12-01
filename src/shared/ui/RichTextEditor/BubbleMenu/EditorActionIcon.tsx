import { ActionIcon, ActionIconProps } from '@mantine/core';
import { ComponentPropsWithRef, ReactNode } from 'react';

import classes from './EditorActionIcon.module.css';

export interface EditorActionIconProps
  extends Omit<ActionIconProps, 'children'>,
    Omit<ComponentPropsWithRef<'button'>, 'color' | 'style'> {
  /** Icon to display */
  icon: ReactNode;
  /** Tooltip/title for the button */
  title: string;
  /** Whether the button represents an active state */
  isActive?: boolean;
  /** Color indicator shown below the icon */
  colorIndicator?: string;
}

/**
 * Styled ActionIcon wrapper for rich text editor controls.
 * Provides consistent styling with optional color indicator.
 */
export const EditorActionIcon = ({
  icon,
  title,
  isActive,
  colorIndicator,
  className,
  ...props
}: EditorActionIconProps): React.ReactElement => {
  return (
    <ActionIcon
      variant={isActive ? 'light' : 'subtle'}
      color={isActive ? 'gray' : 'gray'}
      size='sm'
      title={title}
      data-active={isActive || undefined}
      className={`${classes.actionIcon} ${className ?? ''}`}
      {...props}
    >
      <div className={classes.colorIconWrapper}>
        {icon}
        {colorIndicator && <span className={classes.colorIndicator} style={{ backgroundColor: colorIndicator }} />}
      </div>
    </ActionIcon>
  );
};
