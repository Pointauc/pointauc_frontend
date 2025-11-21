import { Divider, NavLink, Text, Tooltip } from '@mantine/core';
import { OpenInNew } from '@mui/icons-material';
import { Fragment, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MenuItem } from '@models/common.model';

import classes from './App.module.css';

interface AppNavbarItemProps {
  menuItem: MenuItem;
  isActive: boolean;
  showTooltip: boolean;
  onClick: () => void;
}

export function AppNavbarItem({ menuItem, isActive, showTooltip, onClick }: AppNavbarItemProps) {
  const { t } = useTranslation();
  const { icon, title, path, disabled, divide, target } = menuItem;
  const isExternal = target === '_blank';
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Fragment key={path}>
      {divide && <Divider style={{ margin: '10px 0' }} />}
      {showTooltip && <Tooltip label={t(title)} position='right' withArrow />}
      <NavLink<'a' | typeof Link>
        ref={linkRef}
        classNames={{ section: classes.section }}
        to={path}
        active={isActive}
        component={Link}
        target={target}
        disabled={disabled}
        onClick={onClick}
        label={<Text className={classes.navText}>{t(title)}</Text>}
        leftSection={<div className={classes.navIcon}>{icon}</div>}
        rightSection={
          isExternal ? <OpenInNew fontSize='small' sx={{ opacity: 0.6 }} className={classes.navIconRight} /> : undefined
        }
        className={classes.navLink}
      />
    </Fragment>
  );
}
