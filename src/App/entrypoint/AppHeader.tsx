import { AppShell, Burger, Group, Title } from '@mantine/core';
import { TFunction } from 'i18next';

import MobileLanguageSelector from '@components/MobileLanguageSelector/MobileLanguageSelector';
import { MenuItem } from '@models/common.model';

import classes from './App.module.css';

interface AppHeaderProps {
  isNavbarOpened: boolean;
  toggleNavbar: () => void;
  activeMenu?: MenuItem;
  t: TFunction;
}

export const AppHeader = ({ isNavbarOpened, toggleNavbar, activeMenu, t }: AppHeaderProps) => {
  return (
    <AppShell.Header hiddenFrom='sm' px='md' className={classes.header}>
      <Group gap='md' align='center' justify='space-between' h='100%'>
        <Group gap='md' align='center'>
          <Burger opened={isNavbarOpened} onClick={toggleNavbar} />
          <Title order={2}>{t(activeMenu?.title ?? 'common.appName')}</Title>
        </Group>
        <MobileLanguageSelector />
      </Group>
    </AppShell.Header>
  );
};
