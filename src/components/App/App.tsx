import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.scss';
import { createStyles, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import classNames from 'classnames';
import ROUTES from '../../constants/routes.constants';
import AucPage from '../../pages/auction/AucPage';
import { MenuItem } from '../../models/common.model';
import MENU_ITEMS from '../../constants/menuItems.constants';
import SettingsPage from '../SettingsPage/SettingsPage';
import { loadUserData } from '../../reducers/AucSettings/AucSettings';
import withLoading from '../../decorators/withLoading';
import LoadingPage from '../LoadingPage/LoadingPage';
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
import { setCanBeRestored } from '../../reducers/User/User';
import { postRestoreSettings, validateIntegrations } from '../../api/userApi';
import { addAlert } from '../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';

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
  const [isLoading, setIsLoading] = useState<boolean>(hasToken);
  const { username, canBeRestored, authId } = useSelector((root: RootState) => root.user);
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
        validateIntegrations();
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
    if (hasToken) {
      dispatch(withLoading(setIsLoading, loadUserData));
    }
  }, [dispatch]);

  const restoreSettings = useCallback(async () => {
    try {
      await postRestoreSettings(authId || '');
      await loadUserData(dispatch);

      dispatch(addAlert({ type: AlertTypeEnum.Success, message: 'Настройки были успешно перенесены' }));
    } catch (e) {
      dispatch(addAlert({ type: AlertTypeEnum.Error, message: 'Ошибка. Настройки не были перенесены.' }));
    }
  }, [authId, dispatch]);

  const handleClose = useCallback(() => dispatch(setCanBeRestored(false)), [dispatch]);
  const handleConfirm = useCallback(() => {
    restoreSettings();
    handleClose();
  }, [handleClose, restoreSettings]);

  if (isLoading) {
    return <LoadingPage helpText="Загрузка аккаунта..." />;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <Dialog open={!!canBeRestored} maxWidth="md" fullWidth>
        <DialogTitle>Восстановление настроек</DialogTitle>
        <DialogContent dividers className="description-dialog-content">
          <p>
            Недавно у сайта были большие изменения в серверной части, значительно повысилась стабильность работы, а так
            же был переход на более мощный сервер.
          </p>
          <p>
            Но в связи с новым форматом хранения данных все аккаунты не могут быть перенесены автоматически. Но мы можем
            перенести ваши прошлые настройки на этот аккаунт (кроме подключенных интеграций).
          </p>
          <p style={{ color: '#e5c938' }}>
            Хотите восстановить ваши прошлые настройки или продолжить с чистым аккаунтом?
          </p>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} color="default">
            Продолжить как есть
          </Button>
          <Button variant="contained" onClick={handleConfirm} color="primary">
            Восстановить
          </Button>
        </DialogActions>
      </Dialog>
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
