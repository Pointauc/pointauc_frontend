import { AppShell, Stack } from '@mantine/core';
import { TFunction } from 'i18next';

import AuthorContacts from '@components/AuthorContacts/AuthorContacts.tsx';
import { MenuItem } from '@models/common.model';

import { AppNavbarItem } from './AppNavbarItem';
import classes from './App.module.css';

interface AppNavbarProps {
  menuItems: MenuItem[];
  activeMenu?: MenuItem;
  isMobile: boolean;
  closeNavbar: () => void;
  isNavbarExpanded: boolean;
  t: TFunction;
  showDrawer: () => void;
  hideDrawer: () => void;
}

export const AppNavbar = ({
  menuItems,
  activeMenu,
  isMobile,
  closeNavbar,
  isNavbarExpanded,
  showDrawer,
  hideDrawer,
}: AppNavbarProps) => {
  return (
    <AppShell.Navbar className={classes.nav} onMouseEnter={showDrawer} onMouseLeave={hideDrawer}>
      <Stack justify='space-between' h='100%'>
        <Stack gap={0}>
          {menuItems.map((menuItem) => (
            <AppNavbarItem
              key={menuItem.path}
              menuItem={menuItem}
              isActive={activeMenu?.path === menuItem.path}
              showTooltip={activeMenu?.navbarFixedState === 'closed'}
              onClick={closeNavbar}
            />
          ))}
        </Stack>
        <AuthorContacts compact={isMobile ? false : !isNavbarExpanded} />
      </Stack>
    </AppShell.Navbar>
  );
};
