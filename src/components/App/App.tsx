import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.scss';
import { createStyles, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import classNames from 'classnames';
import ROUTES from '../../constants/routes.constants';
import AucPage from '../AucPage/AucPage';
import { MenuItem } from '../../models/common.model';
import MENU_ITEMS from '../../constants/menuItems.constants';
import SettingsPage from '../SettingsPage/SettingsPage';
import { loadUserData, setTwitchListener } from '../../reducers/AucSettings/AucSettings';
import withLoading from '../../decorators/withLoading';
import LoadingPage from '../LoadingPage/LoadingPage';
import IntegrationPage from '../IntegrationPage/IntegrationPage';
import { getCookie } from '../../utils/common.utils';
import TbdPage from '../TbdPage/TbdPage';
import { theme } from '../../constants/theme.constants';
import { RootState } from '../../reducers';
import { connectToServer } from '../../reducers/PubSubSocket/PubSubSocket';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import AlertsContainer from '../AlertsContainer/AlertsContainer';

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
    },
    menuIcon: {
      width: 26,
      height: 26,
      fill: '#fff',
    },
  }),
);

const hasToken = !!getCookie('userToken');

const App: React.FC = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { pathname } = useLocation();
  const { username } = useSelector((root: RootState) => root.user);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(hasToken);

  useEffect(() => {
    if (username) {
      dispatch(connectToServer());
    }
  }, [dispatch, username]);

  const handleCpSubscribe = useCallback(
    ({ data }: MessageEvent) => {
      const { type } = JSON.parse(data);

      if (type === MESSAGE_TYPES.CP_SUBSCRIBED) {
        dispatch(setTwitchListener(true));
      }

      if (type === MESSAGE_TYPES.CP_UNSUBSCRIBED) {
        dispatch(setTwitchListener(false));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', handleCpSubscribe);
    }
  }, [dispatch, handleCpSubscribe, username, webSocket]);

  const showDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const hideDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const isHomePage = useMemo(() => pathname === ROUTES.HOME, [pathname]);
  const isOpen = useMemo(() => pathname !== ROUTES.HOME || isDrawerOpen, [isDrawerOpen, pathname]);
  const drawerClasses = useMemo(
    () => classNames(classes.drawer, { [classes.drawerOpen]: isOpen, [classes.drawerClose]: !isOpen }),
    [classes.drawer, classes.drawerClose, classes.drawerOpen, isOpen],
  );

  const createMenuItem = useCallback(
    ({ IconComponent, title, path }: MenuItem) => (
      <ListItem button key={title} selected={path === pathname} component={Link} to={path}>
        <ListItemIcon>
          <IconComponent className={classes.menuIcon} />
        </ListItemIcon>
        <ListItemText primary={title} />
      </ListItem>
    ),
    [classes.menuIcon, pathname],
  );

  useEffect(() => {
    if (hasToken) {
      dispatch(withLoading(setIsLoading, loadUserData));
    }
  }, [dispatch]);

  if (isLoading) {
    return <LoadingPage helpText="Загрузка аккаунта..." />;
  }

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
              <TbdPage />
            </Route>
            <Route exact path={ROUTES.HISTORY}>
              <TbdPage />
            </Route>
            <Route exact path={ROUTES.HELP}>
              <TbdPage />
            </Route>
          </Switch>
        </main>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
