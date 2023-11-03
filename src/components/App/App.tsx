import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.scss';
import { createStyles, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import classNames from 'classnames';
import ROUTES from '../../constants/routes.constants';
import AucPage from '../../pages/auction/AucPage';
import { MenuItem } from '../../models/common.model';
import MENU_ITEMS from '../../constants/menuItems.constants';
import SettingsPage from '../SettingsPage/SettingsPage';
import { loadUserData } from '../../reducers/AucSettings/AucSettings';
import IntegrationPage from '../IntegrationPage/IntegrationPage';
import { theme } from '../../constants/theme.constants';
import AlertsContainer from '../AlertsContainer/AlertsContainer';
import HistoryPage from '../../pages/history/HistoryPage/HistoryPage';
import WheelPage from '../../pages/wheel/WheelPage/WheelPage';
import HelpPage from '../HelpPage/HelpPage';
import Statistic from '../Statistic/Statistic';
import StopwatchPage from '../StopwatchPage/StopwatchPage';
import RequestsPage from '../RequestsPage/RequestsPage';
import { RootState } from '../../reducers';
import { connectToSocketIo } from '../../reducers/socketIo/socketIo';
import { getCookie } from '../../utils/common.utils';
import { getIntegrationsValidity } from '../../api/userApi';
import { AlertType, AlertTypeEnum } from '../../models/alert.model';
import { addAlert, deleteAlert } from '../../reducers/notifications/notifications';

const drawerWidth = 240;

const useStyles = makeStyles(() =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7) + 3,
    },
    content: {
      flexGrow: 1,
    },
    root: {
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      display: 'flex',
      fontFamily: theme.typography.fontFamily,
      fontWeight: 300,
      minHeight: '100vh',
      maxWidth: '100vw',
    },
    menuIcon: {
      width: 26,
      height: 26,
      fill: '#fff',
    },
  }),
);

const hasToken = !!getCookie('userSession');
const hiddenDrawerRoutes = [ROUTES.HOME, ROUTES.STOPWATCH];

let openDriverTimeout: NodeJS.Timeout;

const App: React.FC = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
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
      interval = setInterval(() => {
        getIntegrationsValidity();
      }, 1000 * 60 * 60 * 3);
    }

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [username]);

  const isHomePage = useMemo(() => pathname === ROUTES.HOME, [pathname]);
  const isOpen = useMemo(() => !hiddenDrawerRoutes.includes(pathname) || isDrawerOpen, [isDrawerOpen, pathname]);
  const drawerClasses = useMemo(
    () => classNames(classes.drawer, { [classes.drawerOpen]: isOpen, [classes.drawerClose]: !isOpen }),
    [classes.drawer, classes.drawerClose, classes.drawerOpen, isOpen],
  );

  const createMenuItem = useCallback(
    ({ IconComponent, title, path, disabled, divide }: MenuItem) => (
      <>
        {divide && <Divider style={{ margin: '10px 0' }} />}
        <ListItem disabled={disabled} button key={title} selected={path === pathname} component={Link} to={path}>
          <ListItemIcon>
            <IconComponent className={classes.menuIcon} />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>
      </>
    ),
    [classes.menuIcon, pathname],
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
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <Drawer
          variant="permanent"
          className={drawerClasses}
          classes={{ paper: drawerClasses }}
          onMouseEnter={showDrawer}
          onMouseLeave={hideDrawer}
        >
          <List>{MENU_ITEMS.map(createMenuItem)}</List>
        </Drawer>
        <main className={classes.content}>
          <div hidden={!isHomePage}>
            <AucPage />
          </div>
          <AlertsContainer />
          <Switch>
            <Route exact path={ROUTES.INTEGRATION}>
              <IntegrationPage />
            </Route>
            <Route exact path={ROUTES.SETTINGS}>
              <SettingsPage />
            </Route>
            <Route exact path={ROUTES.WHEEL}>
              <WheelPage />
            </Route>
            <Route exact path={ROUTES.HISTORY}>
              <HistoryPage />
            </Route>
            <Route exact path={ROUTES.HELP}>
              <HelpPage />
            </Route>
            <Route exact path={ROUTES.STATISTIC}>
              <Statistic />
            </Route>
            <Route exact path={ROUTES.STOPWATCH}>
              <StopwatchPage />
            </Route>
            <Route exact path={ROUTES.REQUESTS}>
              <RequestsPage />
            </Route>
          </Switch>
        </main>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
