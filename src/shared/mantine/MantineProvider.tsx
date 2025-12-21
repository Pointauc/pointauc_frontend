import {
  CSSVariablesResolver,
  MantineProvider as MantineBaseProvider,
  MantineColorsTuple,
  alpha,
  createTheme,
  MantineTheme,
  rem,
  VariantColorsResolver,
  defaultVariantColorsResolver,
} from '@mantine/core';
import { CodeHighlightAdapterProvider, plainTextAdapter } from '@mantine/code-highlight';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DEFAULT_THEME } from '@mantine/core';
import { generateColors } from '@mantine/colors-generator';

import { calcUiElementsOpacity } from '@utils/ui/background';
import { RootState } from '@reducers';

import ExtendedTextInput from './ui/Input';
import ExtendedSlider from './ui/Slider';
import ExtendedCheckbox from './ui/Checkbox';
import ExtendedSegmentedControl from './ui/SegmentedControl';
import ModalExtended from './ui/Modal';
import ExtendedSwitch from './ui/Switch';
import CloseButtonExtended from './ui/CloseButton';

const shadowOpacityMain = 0.12;
const shadowOpacitySecondary = 0.09;
const shadowOpacityXs = 0.2;

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
  const backgroundTone = useSelector((root: RootState) => root.aucSettings.settings.backgroundTone);

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
      spacing: {
        ...DEFAULT_THEME.spacing,
        xxs: rem(6),
      },
      fontFamily: 'Inter, sans-serif',
      colors: {
        darkTransparent: DEFAULT_THEME.colors.dark.map((color) =>
          alpha(color, uiOpacity),
        ) as unknown as MantineColorsTuple,
        primary: generateColors(adjustedPrimary),
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
        CloseButton: CloseButtonExtended,
      },
    });
  }, [uiOpacity, adjustedPrimary]);

  useEffect(() => {
    document.documentElement.style.setProperty('--custom-background-ui-opacity', uiOpacity.toString());
  }, [uiOpacity]);

  return (
    <MantineBaseProvider defaultColorScheme='dark' cssVariablesResolver={cssResolver} theme={theme}>
      <CodeHighlightAdapterProvider adapter={plainTextAdapter}>{children}</CodeHighlightAdapterProvider>
    </MantineBaseProvider>
  );
};

export default MantineProvider;
