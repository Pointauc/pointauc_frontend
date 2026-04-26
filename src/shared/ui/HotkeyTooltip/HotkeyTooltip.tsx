import { Group, Text, Tooltip, type TooltipProps } from '@mantine/core';
import { useKeyHold } from '@tanstack/react-hotkeys';
import { type ReactElement, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { getHotkeyDefinition } from '@shared/lib/hotkeys/hotkeys.registry';
import { checkIsHotkeyVisibleOnPath } from '@shared/lib/hotkeys/hotkeys.routes';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';

interface HotkeyTooltipProps extends Omit<TooltipProps, 'children' | 'label'> {
  actionId: HotkeyActionId;
  children: ReactElement;
  label?: ReactNode;
  showLabel?: boolean;
  visibleOnRoutes?: string[];
}

const HotkeyTooltip = ({
  actionId,
  children,
  label,
  showLabel = true,
  visibleOnRoutes,
  disabled,
  ...tooltipProps
}: HotkeyTooltipProps) => {
  const { pathname } = useLocation();
  const isAltHeld = useKeyHold('Alt');
  const definition = getHotkeyDefinition(actionId);
  const isVisible = checkIsHotkeyVisibleOnPath(pathname, visibleOnRoutes);
  const isDisabled = disabled || !definition.showTooltip || !isVisible;
  const tooltipLabel = showLabel ? (
    <Group gap='xs' wrap='nowrap'>
      <Text inherit>{label}</Text>
      <HotkeyHint actionId={actionId} variant='tooltip' />
    </Group>
  ) : (
    <HotkeyHint actionId={actionId} variant='tooltip' />
  );

  return (
    <Tooltip
      disabled={isDisabled}
      opened={isAltHeld && !isDisabled ? true : undefined}
      label={tooltipLabel}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

export default HotkeyTooltip;
