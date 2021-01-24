import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#a6d4fa',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      paper: '#2d2d2d',
      default: '#242424',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1600,
      xl: 1920,
    },
  },
  typography: {
    h3: {
      fontWeight: 300,
      color: '#f1f1f1',
      marginBottom: 30,
    },
    h5: {
      fontWeight: 300,
      marginBottom: 15,
    },
    h6: {
      fontWeight: 300,
      marginBottom: 5,
    },
    body2: {
      fontWeight: 300,
      fontSize: 16,
      marginBottom: 13,
    },
    fontFamily: ['Helvetica Neue', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(','),
  },
  overrides: {
    MuiFormControlLabel: {
      label: {
        fontWeight: 300,
        letterSpacing: 0.9,
        color: '#f1f1f1',
      },
    },
  },
});
