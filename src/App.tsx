import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import './App.scss';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Container, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import donatePay from '@components/Integration/DonatePay';
import { setDonatePaySubscribeState } from '@reducers/Subscription/Subscription.ts';
import AuthorContacts from '@components/AuthorContacts/AuthorContacts.tsx';
import NewSettingsPage from '@pages/settings/NewSettingsPage.tsx';
import Metadata from '@components/Metadata';
import LogoutPage from '@pages/logout/LogoutPage.tsx';

import ROUTES from './constants/routes.constants';
import AucPage from './pages/auction/AucPage';
import { MenuItem } from './models/common.model';
import { useMenuItems } from './constants/menuItems.constants';
import { loadUserData } from './reducers/AucSettings/AucSettings';
import AlertsContainer from './components/AlertsContainer/AlertsContainer';
import HistoryPage from './pages/history/HistoryPage/HistoryPage';
import WheelPage from './pages/wheel/WheelPage/WheelPage';
import HelpPage from './components/HelpPage/HelpPage';
import Statistic from './components/Statistic/Statistic';
import StopwatchPage from './components/StopwatchPage/StopwatchPage';
import RequestsPage from './components/RequestsPage/RequestsPage';
import { connectToSocketIo } from './reducers/socketIo/socketIo';
import { getCookie } from './utils/common.utils';
import { getIntegrationsValidity } from './api/userApi';
import { AlertType, AlertTypeEnum } from './models/alert.model';
import { addAlert, deleteAlert } from './reducers/notifications/notifications';

import type { ThunkDispatch } from 'redux-thunk';

const hasToken = !!getCookie('userSession');
const hiddenDrawerRoutes = [ROUTES.HOME, ROUTES.STOPWATCH, ROUTES.WHEEL];
const lockedDrawerRoutes = [ROUTES.WHEEL];

let openDriverTimeout: any;

const StyledDrawer = styled(Drawer)(({ theme }: any) => ({
  transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
})) as any;

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { pathname } = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { username } = useSelector((root: RootState) => root.user);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const menuItems = useMenuItems();

  const showDrawer = useCallback(() => {
    openDriverTimeout = setTimeout(() => setIsDrawerOpen(true), 70);
  }, []);
  const hideDrawer = useCallback(() => {
    clearTimeout(openDriverTimeout);
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (username && !webSocket) {
      dispatch(connectToSocketIo);
    }
  }, [dispatch, username, webSocket]);

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
  const isOpen = useMemo(
    () => (!hiddenDrawerRoutes.includes(pathname) || isDrawerOpen) && !lockedDrawerRoutes.includes(pathname),
    [isDrawerOpen, pathname],
  );
  const drawerClasses = useMemo(() => classNames('app-drawer', { open: isOpen, close: !isOpen }), [isOpen]);

  const createMenuItem = useCallback(
    ({ icon, title, path, disabled, divide }: MenuItem) => (
      <Fragment key={path}>
        {divide && <Divider style={{ margin: '10px 0' }} />}
        <ListItemButton disabled={disabled} key={t(title)} selected={path === pathname} component={Link} to={path}>
          <ListItemIcon className='nav-icon'>{icon}</ListItemIcon>
          <ListItemText className='nav-text' primary={t(title)} />
        </ListItemButton>
      </Fragment>
    ),
    [pathname, t],
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

  return (
    <div className='app'>
      <Metadata />
      <StyledDrawer
        className={drawerClasses}
        variant='permanent'
        PaperProps={{
          sx: {
            position: 'relative',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
          },
        }}
        onMouseEnter={showDrawer}
        onMouseLeave={hideDrawer}
      >
        <div className='c'>
          <div className='grow'>
            <List>{menuItems.map(createMenuItem)}</List>
          </div>
          <AuthorContacts />
        </div>
      </StyledDrawer>
      <Container className='app-content'>
        <div hidden={!isHomePage}>
          <AucPage />
        </div>
        <AlertsContainer />
        <Routes>
          <Route path={`${ROUTES.SETTINGS}/*`} element={<NewSettingsPage />} />
          <Route path={ROUTES.WHEEL} element={<WheelPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.HELP} element={<HelpPage />} />
          <Route path={ROUTES.STATISTIC} element={<Statistic />} />
          <Route path={ROUTES.STOPWATCH} element={<StopwatchPage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
        </Routes>
      </Container>
    </div>
  );
};

export default App;
