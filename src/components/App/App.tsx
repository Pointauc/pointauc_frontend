import React, { useEffect } from 'react';
import './App.scss';
import { createStyles, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { Link as MatLink, Typography } from '@material-ui/core';
import { Redirect } from 'react-router';
import { theme } from '../../constants/theme.constants';

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

const App: React.FC = () => {
  const classes = useStyles();

  useEffect(() => {
    window.location.assign('https://pointauc.ru');
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <div className="new-back-container">
          {/* <Typography> */}
          {/*  <span>Обновленный сервер был перенесен на основной сайт - </span> */}
          {/*  <MatLink target="_blank" rel="noopener noreferrer" className="da-link gitlab" href="https://pointauc.ru"> */}
          {/*    https://pointauc.ru */}
          {/*  </MatLink> */}
          {/*  <span>, всем спасибо за пользование сайтом)</span> */}
          {/* </Typography> */}
          {/* <br /> */}
          {/* <Typography> */}
          {/*  Хочу предупредить, что в будущем какие-либо эксперементальные фичи сайта будут хоститься только на доменах */}
          {/*  <span className="highlight"> "pointauc.ru"</span> */}
          {/*  <span>, </span> */}
          {/*  <span className="highlight">"pointauc.com" </span> */}
          {/*  или их поддоменах */}
          {/*  <span className="highlight"> "feature.pointauc.ru"</span>. */}
          {/* </Typography> */}
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
