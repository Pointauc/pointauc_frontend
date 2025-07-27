import {
  CSSVariablesResolver,
  MantineProvider as MantineBaseProvider,
  MantineColorsTuple,
  alpha,
  createTheme,
  MantineTheme,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DEFAULT_THEME } from '@mantine/core';

import mantineTheme from '@constants/mantineTheme';
import { calcUiElementsOpacity } from '@utils/ui/background';

import { RootState } from './reducers';

const shadowOpacityMain = 0.12;
const shadowOpacitySecondary = 0.09;
const shadowOpacityXs = 0.2;

const cssResolver: CSSVariablesResolver = (theme) => ({
  variables: {},
  dark: {
    '--mantine-color-text': '#f3f3f3',

    '--mantine-shadow-xs': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), 0 calc(0.0625rem * var(--mantine-scale)) calc(0.125rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityXs})`,
    '--mantine-shadow-sm': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.9375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.4375rem * var(--mantine-scale)) calc(0.4375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-md': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.25rem * var(--mantine-scale)) calc(1.5625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-lg': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.75rem * var(--mantine-scale)) calc(1.4375rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.75rem * var(--mantine-scale)) calc(0.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
    '--mantine-shadow-xl': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(2.25rem * var(--mantine-scale)) calc(1.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(1.0625rem * var(--mantine-scale)) calc(1.0625rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
  },
  light: {},
});

const MantineProvider = ({ children }: { children: React.ReactNode }) => {
  const backgroundOverlayOpacity = useSelector((root: RootState) => root.aucSettings.settings.backgroundOverlayOpacity);
  const backgroundTone = useSelector((root: RootState) => root.aucSettings.settings.backgroundTone);

  const theme = useMemo(() => {
    const uiOpacity = calcUiElementsOpacity(backgroundOverlayOpacity);
    return createTheme({
      colors: {
        darkOpaque: DEFAULT_THEME.colors.dark.map((color) => alpha(color, uiOpacity)) as unknown as MantineColorsTuple,
      },
      components: {
        Notification: {
          styles: (theme: MantineTheme) => ({
            title: {
              fontSize: theme.fontSizes.lg, // Increased from default
            },
            description: {
              fontSize: theme.fontSizes.md, // Increased from default (sm)
              color: 'var(--mantine-color-dark-1)', // Brighter text color
            },
          }),
        },
      },
    });
  }, [backgroundOverlayOpacity]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--custom-background-ui-opacity',
      calcUiElementsOpacity(backgroundOverlayOpacity).toString(),
    );
  }, [backgroundOverlayOpacity]);

  return (
    <MantineBaseProvider defaultColorScheme='dark' cssVariablesResolver={cssResolver} theme={theme}>
      {children}
    </MantineBaseProvider>
  );
};

export default MantineProvider;
