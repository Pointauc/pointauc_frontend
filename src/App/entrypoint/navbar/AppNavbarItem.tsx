import { Tooltip } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MenuItem } from '@models/common.model';
import { resolveNavbarHotkeyActionId } from '@shared/lib/hotkeys/hotkeys.registry';
import HotkeyTooltip from '@shared/ui/HotkeyTooltip/HotkeyTooltip';

const checkIsExternalNav = (path: string, target?: MenuItem['target']): boolean =>
  target === '_blank' || /^https?:\/\//.test(path);

interface AppNavbarItemProps {
  menuItem: MenuItem;
  isActive: boolean;
  isNextActive: boolean;
  onMouseDown: (menuItem: MenuItem) => void;
  onMouseUp: (menuItem: MenuItem) => void;
}

export const AppNavbarItem = ({ menuItem, isActive, isNextActive, onMouseDown, onMouseUp }: AppNavbarItemProps) => {
  const { t } = useTranslation();
  const { icon, title, path, target } = menuItem;
  const isExternal = checkIsExternalNav(path, target);
  const hotkeyActionId = resolveNavbarHotkeyActionId(path);

  const linkClassName = clsx(
    'group relative flex h-[46px] items-center justify-center rounded-md border text-inherit no-underline transition-[background-color,border-color] duration-150 hover:bg-primary-400/20 active:bg-primary-light-hover active:border-primary-500',
    isNextActive ? 'border-primary-500' : 'border-transparent',
  );

  const iconClassName = clsx(
    'flex transition-colors duration-150 [&_svg]:size-[26px]',
    isActive ? 'text-primary-500' : 'group-hover:text-primary-500',
  );

  const externalIconClassName =
    'pointer-events-none absolute bottom-[3px] right-[3px] flex items-center justify-center opacity-50 text-dimmed [&_svg]:size-[14px] group-hover:text-primary-500 group-hover:opacity-100';

  const navLink = isExternal ? (
    <a
      href={path}
      rel='noopener noreferrer'
      target={target}
      className={linkClassName}
      onMouseDown={() => onMouseDown(menuItem)}
      onMouseUp={() => onMouseUp(menuItem)}
    >
      <div className={iconClassName}>{icon}</div>
      <span className={externalIconClassName} aria-hidden>
        <IconArrowUpRight />
      </span>
    </a>
  ) : (
    <Link
      to={path}
      target={target}
      className={linkClassName}
      onMouseDown={() => onMouseDown(menuItem)}
      onMouseUp={() => onMouseUp(menuItem)}
    >
      <div className={iconClassName}>{icon}</div>
    </Link>
  );

  if (!hotkeyActionId) {
    return (
      <Tooltip label={t(title)} px='sm' py='xs' fw={600} fz='md' position='right' withArrow arrowSize={7}>
        {navLink}
      </Tooltip>
    );
  }

  return (
    <HotkeyTooltip
      actionId={hotkeyActionId}
      label={t(title)}
      px='sm'
      py='xs'
      fw={600}
      fz='md'
      position='right'
      withArrow
      arrowSize={7}
    >
      {navLink}
    </HotkeyTooltip>
  );
};
