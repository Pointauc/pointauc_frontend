import { CodeHighlightAdapterProvider, plainTextAdapter } from '@mantine/code-highlight';
import { generateColors } from '@mantine/colors-generator';
import {
  alpha,
  createTheme,
  CSSVariablesResolver,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  Divider,
  MantineProvider as MantineBaseProvider,
  MantineColorsTuple,
  MantineTheme,
  rem,
  VariantColorsResolver,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { calcUiElementsOpacity } from '@utils/ui/background';

import ExtendedCheckbox from './ui/Checkbox';
import CloseButtonExtended from './ui/CloseButton';
import ExtendedTextInput from './ui/Input';
import ModalExtended from './ui/Modal';
import ExtendedSegmentedControl from './ui/SegmentedControl';
import ExtendedSlider from './ui/Slider';
import ExtendedSwitch from './ui/Switch';

const shadowOpacityMain = 0.12;
const shadowOpacitySecondary = 0.09;
const shadowOpacityXs = 0.2;

const darkPaletteBase = [
  '#a0a0a0',
  '#868686',
  '#727272',
  '#606060',
  '#3e3e3e',
  '#363636',
  '#303030',
  '#282828',
  '#212121',
  '#1b1b1b',
] as const;

const darkPalette = darkPaletteBase;

const cssResolver: CSSVariablesResolver = (theme) => ({
  variables: {},
  dark: {
    '--mantine-color-text': '#eeeeee',

    '--mantine-shadow-xs': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), 0 calc(0.0625rem * var(--mantine-scale)) calc(0.125rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityXs})`,
    '--mantine-shadow-sm': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.9375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.4375rem * var(--mantine-scale)) calc(0.4375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-md': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.25rem * var(--mantine-scale)) calc(1.5625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-lg': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.75rem * var(--mantine-scale)) calc(1.4375rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.75rem * var(--mantine-scale)) calc(0.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
    '--mantine-shadow-xl': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(2.25rem * var(--mantine-scale)) calc(1.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(1.0625rem * var(--mantine-scale)) calc(1.0625rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
  },
  light: {},
});

const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input);

  if (input.variant === 'subtle' && input.color === 'white') {
    return {
      ...defaultResolvedColors,
      hover: 'var(--mantine-color-dark-5)',
    };
  }

  return defaultResolvedColors;
};

const MantineProvider = ({ children }: { children: React.ReactNode }) => {
  const primaryColor = useSelector((root: RootState) => root.aucSettings.settings.primaryColor);
  const backgroundOverlayOpacity = useSelector((root: RootState) => root.aucSettings.settings.backgroundOverlayOpacity);
  const darkAlpha = useSelector((root: RootState) => root.overlay.darkAlpha);

  const adjustedPrimary = primaryColor === '#a6d4fa' ? '#228be6' : primaryColor ?? '#228be6';

  const uiOpacity = useMemo(
    () => darkAlpha ?? calcUiElementsOpacity(backgroundOverlayOpacity),
    [darkAlpha, backgroundOverlayOpacity],
  );

  const theme = useMemo(() => {
    return createTheme({
      variantColorResolver,
      cursorType: 'pointer',
      primaryColor: 'primary',
      defaultRadius: 'sm',
      spacing: {
        ...DEFAULT_THEME.spacing,
        xxs: rem(6),
      },
      fontFamily: 'Inter, sans-serif',
      colors: {
        dark: darkPalette,
        darkTransparent: darkPalette.map((color) => alpha(color, uiOpacity)) as unknown as MantineColorsTuple,
        primary: adjustedPrimary ? generateColors(adjustedPrimary) : generateColors('#228be6'),
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
        TextInput: ExtendedTextInput,
        Slider: ExtendedSlider,
        Button: { defaultProps: { size: 'md' } },
        Checkbox: ExtendedCheckbox,
        SegmentedControl: ExtendedSegmentedControl,
        Switch: ExtendedSwitch,
        Select: {
          defaultProps: {
            size: 'md',
            comboboxProps: { transitionProps: { transition: 'pop', duration: 100 } },
          },
        },
        Modal: ModalExtended,
        Tooltip: {
          defaultProps: {
            color: 'gray',
          },
        },
        Divider: {
          defaultProps: {
            color: 'dark.5',
          },
        },
        CloseButton: CloseButtonExtended,
      },
    });
  }, [uiOpacity, adjustedPrimary]);

  useEffect(() => {
    document.documentElement.style.setProperty('--custom-background-ui-opacity', uiOpacity.toString());
  }, [uiOpacity]);

  return (
    <MantineBaseProvider defaultColorScheme='dark' cssVariablesResolver={cssResolver} theme={theme}>
      <ModalsProvider>
        <CodeHighlightAdapterProvider adapter={plainTextAdapter}>{children}</CodeHighlightAdapterProvider>
      </ModalsProvider>
    </MantineBaseProvider>
  );
};

export default MantineProvider;
