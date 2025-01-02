import { createTheme, lighten } from '@mui/material';
import { alpha, getContrastRatio } from '@mui/material/styles';

const backgroundColor = '#242424';

const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a6d4fa',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      paper: lighten(backgroundColor, 0.05),
      default: backgroundColor,
    },
    text: {
      primary: '#f3f3f3',
    },
  },
  typography: {
    fontFamily: ['Helvetica Neue', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          lineHeight: '1.1876em',
        },
        input: {
          padding: '11px 12px',
          height: '1.1876em',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        PaperProps: {
          elevation: 0,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
    },
    MuiTypography: {
      defaultProps: {
        color: 'textPrimary',
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          fontSize: theme.typography.body2.fontSize,
        }),
      },
    },
  },
});

const blankColor = baseTheme.palette.text.primary;

export const theme = createTheme(baseTheme, {
  palette: {
    blank: baseTheme.palette.augmentColor({
      color: { main: blankColor },
      name: 'blank',
    }),
  },
});
