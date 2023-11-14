import { makeStyles } from '@mui/styles';

const drawerWidth = 240;

export const useStyles = makeStyles((theme) => ({
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
}));
