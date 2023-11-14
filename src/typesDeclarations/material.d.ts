declare module '@mui/material/styles' {
  interface Palette {
    blank: Palette['primary'];
  }

  interface PaletteOptions {
    blank?: PaletteOptions['primary'];
  }
}

import '@mui/material';
declare module '@mui/material' {
  interface ButtonPropsColorOverrides {
    blank: true;
  }
}
