import { AppShell, Stack } from '@mantine/core';
import { TFunction } from 'i18next';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { flattenMenuGroups, useActiveMenu, useMenuGroups } from '@constants/menuItems.constants';
import { MenuItem } from '@models/common.model';
import { resolveNavbarPathForAction } from '@shared/lib/hotkeys/hotkeys.registry';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';

import NavbarGroup from './Group';

interface AppNavbarProps {
  onActiveMenuChange: (activeMenu: MenuItem | undefined) => void;
  isMobile: boolean;
  closeNavbar: () => void;
  isNavbarExpanded: boolean;
  t: TFunction;
  showDrawer: () => void;
  hideDrawer: () => void;
}

export const AppNavbar = ({ onActiveMenuChange }: AppNavbarProps) => {
  const navigate = useNavigate();
  const menuGroups = useMenuGroups();
  const menuItems = useMemo(() => flattenMenuGroups(menuGroups), [menuGroups]);
  const activeMenu = useActiveMenu(menuItems);
  const [nextActiveMenu, setNextActiveMenu] = useState<MenuItem | undefined>(undefined);

  useAppHotkey(HOTKEY_ACTION_IDS.navigateAuction, () => navigate(resolveNavbarPathForAction(HOTKEY_ACTION_IDS.navigateAuction)!), {
    preventDefault: true,
  });
  useAppHotkey(HOTKEY_ACTION_IDS.navigateWheel, () => navigate(resolveNavbarPathForAction(HOTKEY_ACTION_IDS.navigateWheel)!), {
    preventDefault: true,
  });
  useAppHotkey(
    HOTKEY_ACTION_IDS.navigateSettings,
    () => navigate(resolveNavbarPathForAction(HOTKEY_ACTION_IDS.navigateSettings)!),
    {
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.navigateOverlays,
    () => navigate(resolveNavbarPathForAction(HOTKEY_ACTION_IDS.navigateOverlays)!),
    {
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.navigateTicketVerification,
    () => navigate(resolveNavbarPathForAction(HOTKEY_ACTION_IDS.navigateTicketVerification)!),
    {
      preventDefault: true,
    },
  );

  useLayoutEffect(() => {
    onActiveMenuChange(activeMenu);
  }, [activeMenu, onActiveMenuChange]);

  return (
    <AppShell.Navbar withBorder={false} bg='transparent'>
      <Stack justify='space-between' h='100%' pl='md' pr={0} py='lg'>
        <Stack gap='sm'>
          <NavbarGroup
            items={menuGroups.primary}
            activeMenu={activeMenu}
            nextActiveMenu={nextActiveMenu}
            onMouseDown={setNextActiveMenu}
            onMouseUp={() => setNextActiveMenu(undefined)}
          />
          <NavbarGroup
            items={menuGroups.secondary}
            activeMenu={activeMenu}
            nextActiveMenu={nextActiveMenu}
            onMouseDown={setNextActiveMenu}
            onMouseUp={() => setNextActiveMenu(undefined)}
          />
        </Stack>
        <NavbarGroup
          items={menuGroups.tertiary}
          activeMenu={activeMenu}
          nextActiveMenu={nextActiveMenu}
          onMouseDown={setNextActiveMenu}
          onMouseUp={() => setNextActiveMenu(undefined)}
        />
      </Stack>
    </AppShell.Navbar>
  );
};
