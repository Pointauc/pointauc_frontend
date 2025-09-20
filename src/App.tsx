import { AppShell, Burger, Divider, Group, NavLink, Stack, Text, Title, Tooltip } from '@mantine/core';
import { OpenInNew } from '@mui/icons-material';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';

import AuthorContacts from '@components/AuthorContacts/AuthorContacts.tsx';
import donatePay from '@components/Integration/DonatePay';
import Metadata from '@components/Metadata';
import MobileLanguageSelector from '@components/MobileLanguageSelector/MobileLanguageSelector';
import UserSettings from '@domains/user-settings/pages/UserSettings/UserSettings';
import LogoutPage from '@pages/logout/LogoutPage.tsx';
import { RootState } from '@reducers';
import { setDonatePaySubscribeState } from '@reducers/Subscription/Subscription.ts';
import { COLORS } from '@constants/color.constants';
import { useIsMobile } from '@shared/lib/ui';

import classes from './App.module.css';
import { getIntegrationsValidity } from './api/userApi';
import AlertsContainer from './components/AlertsContainer/AlertsContainer';
import HelpPage from './components/HelpPage/HelpPage';
import RequestsPage from './components/RequestsPage/RequestsPage';
import { useActiveMenu, useMenuItems } from './constants/menuItems.constants';
import ROUTES from './constants/routes.constants';
import { connectToBroadcastingSocket } from './domains/broadcasting/lib/socket';
import { useLotsBroadcasting } from './domains/broadcasting/lib/useLotsBroadcasting';
import { AlertType, AlertTypeEnum } from './models/alert.model';
import { MenuItem } from './models/common.model';
import AucPage from './pages/auction/AucPage';
import HistoryPage from './pages/history/HistoryPage/HistoryPage';
import WheelPage from './pages/wheel/WheelPage/WheelPage';
import { loadUserData, setAucSettings } from './reducers/AucSettings/AucSettings';
import { addAlert, deleteAlert } from './reducers/notifications/notifications';
import { connectToSocketIo } from './reducers/socketIo/socketIo';
import { getCookie } from './utils/common.utils';

import type { ThunkDispatch } from 'redux-thunk';

const hasToken = !!getCookie('userSession');

let openDriverTimeout: any;

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { pathname } = useLocation();
  const [isHovered, setIsDrawerOpen] = useState(false);
  const { username } = useSelector((root: RootState) => root.user);
  const menuItems = useMenuItems();
  const activeMenu = useActiveMenu(menuItems);
  const isColorResetDone = useRef(localStorage.getItem('isColorResetDone') === 'true');

  const [isNavbarOpened, mobileNavbar] = useDisclosure();
  const isMobile = useIsMobile();

  if (!isColorResetDone.current && !hasToken) {
    localStorage.setItem('isColorResetDone', 'true');
    isColorResetDone.current = true;
    dispatch(setAucSettings({ primaryColor: COLORS.THEME.PRIMARY }));
  }

  const showDrawer = useCallback(() => {
    openDriverTimeout = setTimeout(() => setIsDrawerOpen(true), 70);
  }, []);
  const hideDrawer = useCallback(() => {
    clearTimeout(openDriverTimeout);
    setIsDrawerOpen(false);
  }, []);

  useLotsBroadcasting();

  useEffect(() => {
    if (username) {
      dispatch(connectToSocketIo);
      dispatch(connectToBroadcastingSocket);
    }
  }, [dispatch, username]);

  useEffect(() => {
    let interval: any;
    if (hasToken && username) {
      interval = setInterval(
        () => {
          getIntegrationsValidity();
        },
        1000 * 60 * 60 * 3,
      );
    }

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [username]);

  const isHomePage = useMemo(() => pathname === ROUTES.HOME, [pathname]);

  const createMenuItem = useCallback(
    ({ icon, title, path, disabled, divide, target }: MenuItem) => {
      const isExternal = target === '_blank';
      const linkProps = isExternal ? { href: path, target } : { to: path };

      return (
        <Fragment key={path}>
          {divide && <Divider style={{ margin: '10px 0' }} />}
          <Tooltip hidden={activeMenu?.navbarFixedState !== 'closed'} label={t(title)} position='right' withArrow>
            <NavLink<'a' | typeof Link>
              classNames={{ section: classes.section }}
              to={path}
              active={path === activeMenu?.path}
              component={Link}
              target={target}
              disabled={disabled}
              onClick={() => {
                if (isMobile) {
                  console.log('close');
                  mobileNavbar.close();
                }
              }}
              label={<Text className={classes.navText}>{t(title)}</Text>}
              leftSection={<div className={classes.navIcon}>{icon}</div>}
              rightSection={
                isExternal ? (
                  <OpenInNew fontSize='small' sx={{ opacity: 0.6 }} className={classes.navIconRight} />
                ) : undefined
              }
              className={classes.navLink}
            />
          </Tooltip>
        </Fragment>
      );
    },
    [activeMenu?.navbarFixedState, activeMenu?.path, t, isMobile, mobileNavbar],
  );

  useEffect(() => {
    const loadUser = async () => {
      const loadingAlert: AlertType = {
        message: t('common.accountProgress'),
        type: AlertTypeEnum.Info,
        id: Math.random(),
      };

      dispatch(addAlert(loadingAlert));
      try {
        await loadUserData(dispatch);
      } finally {
        dispatch(deleteAlert(loadingAlert.id));
      }
    };

    if (hasToken) {
      loadUser();
    }
    // do not add t function to the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    const unsub = donatePay.pubsubFlow.events.on('subscribed', () =>
      dispatch(setDonatePaySubscribeState({ actual: true })),
    );
    const unsub2 = donatePay.pubsubFlow.events.on('unsubscribed', () =>
      dispatch(setDonatePaySubscribeState({ actual: false })),
    );

    return () => {
      unsub();
      unsub2();
    };
  }, [dispatch]);

  const isNavbarExpanded = useMemo(() => {
    return (isHovered && activeMenu?.navbarFixedState !== 'closed') || activeMenu?.navbarFixedState === 'opened';
  }, [isHovered, activeMenu]);

  return (
    <AppShell
      padding={0}
      className={clsx(classes.app, {
        [classes.expanded]: isNavbarExpanded,
        [classes.fixedOpened]: activeMenu?.navbarFixedState === 'opened',
      })}
      header={{ height: { base: 50, sm: 0 } }}
      navbar={{ width: 61, breakpoint: 'sm', collapsed: { mobile: !isNavbarOpened } }}
      transitionDuration={isMobile ? 200 : 0}
    >
      <Metadata />
      <AppShell.Header hiddenFrom='sm' px='md' className={classes.header}>
        <Group gap='md' align='center' justify='space-between' h='100%'>
          <Group gap='md' align='center'>
            <Burger opened={isNavbarOpened} onClick={mobileNavbar.toggle} />
            <Title order={2}>{t(activeMenu?.title ?? 'common.appName')}</Title>
          </Group>
          <MobileLanguageSelector />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar className={classes.nav} onMouseEnter={showDrawer} onMouseLeave={hideDrawer}>
        <Stack justify='space-between' h='100%'>
          <Stack gap={0}>{menuItems.map(createMenuItem)}</Stack>
          <AuthorContacts compact={isMobile ? false : !isNavbarExpanded} />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main className={classes.main}>
        <div style={{ display: isHomePage ? 'contents' : 'none' }} hidden={!isHomePage}>
          <AucPage />
        </div>
        <AlertsContainer />
        <Routes>
          <Route path={`${ROUTES.SETTINGS}/*`} element={<UserSettings />} />
          <Route path={ROUTES.WHEEL} element={<WheelPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.HELP} element={<HelpPage />} />
          {/* <Route path={ROUTES.STATISTIC} element={<Statistic />} /> */}
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          {/* <Route path={ROUTES.OVERLAYS} element={<OverlaysPage />} /> */}
          {/* <Route path={ROUTES.OVERLAY_EDIT} element={<OverlayPage />} /> */}
          <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
