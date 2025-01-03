import React, { FC, ReactNode, useMemo } from 'react';
import { createTheme, lighten, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { useSelector } from 'react-redux';
import tinycolor from 'tinycolor2';

import { theme } from '@constants/theme.constants.ts';
import { RootState } from '@reducers';

interface Props {
  children: ReactNode;
}

const ThemeWrapper: FC<Props> = ({ children }) => {
  const primaryColor = useSelector((root: RootState) => root.aucSettings.settings.primaryColor);
  const backgroundTone = useSelector((root: RootState) => root.aucSettings.settings.backgroundTone);

  const updatedTheme = useMemo(() => {
    const { paper, default: backgroundDefault } = theme.palette.background;
    const background = backgroundTone === 'transparent' ? backgroundDefault : backgroundTone;
    const paperTone = lighten(background, 0.05);

    document.documentElement.style.setProperty('--color-primary', primaryColor);

    return createTheme(theme, {
      palette: {
        primary: theme.palette.augmentColor({
          color: { main: primaryColor },
          name: 'primary',
        }),
        background: {
          paper: `#${tinycolor.mix(paper, paperTone, 7).toHex()}`,
          default: `#${tinycolor.mix(backgroundDefault, background, 7).toHex()}`,
        },
      },
    });
  }, [primaryColor, backgroundTone]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={updatedTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeWrapper;
