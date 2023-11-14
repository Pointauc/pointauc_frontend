import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import './App.scss';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Container, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';

import { RootState } from '@reducers';
import Roulette from '@pages/roulette';

import ROUTES from './constants/routes.constants';
import AucPage from './pages/auction/AucPage';
import { MenuItem } from './models/common.model';
import MENU_ITEMS from './constants/menuItems.constants';
import SettingsPage from './components/SettingsPage/SettingsPage';
import { loadUserData } from './reducers/AucSettings/AucSettings';
import IntegrationPage from './components/IntegrationPage/IntegrationPage';
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
const hiddenDrawerRoutes = [ROUTES.HOME, ROUTES.STOPWATCH];

let openDriverTimeout: number;

const StyledDrawer = styled(Drawer)(({ theme }: any) => ({
  transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
})) as any;

const App: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { pathname } = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { username } = useSelector((root: RootState) => root.user);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

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
  const isOpen = useMemo(() => !hiddenDrawerRoutes.includes(pathname) || isDrawerOpen, [isDrawerOpen, pathname]);
  const drawerClasses = useMemo(() => classNames('app-drawer', { open: isOpen, close: !isOpen }), [isOpen]);

  const createMenuItem = useCallback(
    ({ IconComponent, title, path, disabled, divide }: MenuItem) => (
      <Fragment key={path}>
        {divide && <Divider style={{ margin: '10px 0' }} />}
        <ListItem disabled={disabled} button key={title} selected={path === pathname} component={Link} to={path}>
          <ListItemIcon className='nav-icon'>
            <IconComponent />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>
      </Fragment>
    ),
    [pathname],
  );

  useEffect(() => {
    const loadUser = async () => {
      const loadingAlert: AlertType = {
        message: 'Загрузка аккаунта...',
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
  }, [dispatch]);

  return (
    <div className='app'>
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
        <List>{MENU_ITEMS.map(createMenuItem)}</List>
      </StyledDrawer>
      <Container className='app-content'>
        <div hidden={!isHomePage}>
          <AucPage />
        </div>
        <AlertsContainer />
        <Routes>
          <Route path={ROUTES.INTEGRATION} element={<IntegrationPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.WHEEL} element={<WheelPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.HELP} element={<HelpPage />} />
          <Route path={ROUTES.STATISTIC} element={<Statistic />} />
          <Route path={ROUTES.STOPWATCH} element={<StopwatchPage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.ROULETTE} element={<Roulette />} />
        </Routes>
      </Container>
    </div>
  );
};

export default App;
