import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type PaperVariant = 'plain' | 'glass';
export type PaperElevation = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PaperRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type PaperPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PaperBorder = 'none' | 'subtle' | 'default' | 'strong';
export type PaperComponent = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'li';

export type PaperLiquidGlassPreset = 'subtle' | 'frosted' | 'crystal' | 'floating';
export type PaperGlassBlur = 'sm' | 'md' | 'lg' | 'xl';
export type PaperGlassTint = 'neutral' | 'cool' | 'warm' | 'primary';
export type PaperGlassOpacity = 'faint' | 'soft' | 'medium' | 'strong';
export type PaperGlassSaturation = 'normal' | 'vivid' | 'intense';
export type PaperGlassBorder = 'none' | 'subtle' | 'visible' | 'bright';
export type PaperGlassHighlight = 'none' | 'soft' | 'medium' | 'strong';
export type PaperGlassDepth = 'flat' | 'raised' | 'floating';

interface PaperGlassOptions {
  glassBlur: PaperGlassBlur;
  glassTint: PaperGlassTint;
  glassOpacity: PaperGlassOpacity;
  glassSaturation: PaperGlassSaturation;
  glassBorder: PaperGlassBorder;
  glassHighlight: PaperGlassHighlight;
  glassDepth: PaperGlassDepth;
}

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  /** Content rendered inside the paper surface. It does not add layout styles by itself. */
  children?: ReactNode;

  /** HTML element used for the outer surface. Pick the semantic tag without changing the default visual style. */
  component?: PaperComponent;

  /** Visual treatment of the surface. `plain` uses a solid paper background, while `glass` adds translucent blur, tint, and light overlays. */
  variant?: PaperVariant;

  /** Shadow depth from the app elevation scale. Higher values make the paper feel more raised above the page. */
  elevation?: PaperElevation;

  /** Corner rounding for the paper card. Larger values make the surface feel softer and more card-like. */
  radius?: PaperRadius;

  /** Inner spacing between the paper edge and its content. Use `none` when the child controls its own spacing. */
  padding?: PaperPadding;

  /** Built-in border strength for the plain variant. The glass variant uses `glassBorder` unless `borderClassName` is provided. */
  border?: PaperBorder;

  /** Tailwind background utility override, for example `bg-paper-900` or `bg-primary-light`. Overrides plain and glass tint backgrounds. */
  backgroundClassName?: string;

  /** Tailwind border utility override. Use when the built-in `border` or `glassBorder` options are not specific enough. */
  borderClassName?: string;

  /** Glass-only preset that sets blur, tint, opacity, saturation, border, highlight, and depth together. Individual glass props override it. */
  liquidGlassPreset?: PaperLiquidGlassPreset;

  /** Glass-only backdrop blur amount. Higher values make content behind the paper look softer and more diffused. */
  glassBlur?: PaperGlassBlur;

  /** Glass-only color family for the translucent surface tint. Pair with `glassOpacity` to control the visible background cast. */
  glassTint?: PaperGlassTint;

  /** Glass-only tint intensity. Higher values make the surface less transparent and more visually present. */
  glassOpacity?: PaperGlassOpacity;

  /** Glass-only backdrop saturation. Higher values make colors behind the surface feel brighter through the blur. */
  glassSaturation?: PaperGlassSaturation;

  /** Glass-only edge visibility. Higher values make the refractive border read as sharper and brighter. */
  glassBorder?: PaperGlassBorder;

  /** Glass-only sheen overlay strength. Higher values make the top light streak and radial glow more pronounced. */
  glassHighlight?: PaperGlassHighlight;

  /** Glass-only drop-shadow depth. Higher values make the glass appear to float farther above the background. */
  glassDepth?: PaperGlassDepth;
}

const defaultGlassOptions: PaperGlassOptions = {
  glassBlur: 'md',
  glassTint: 'neutral',
  glassOpacity: 'soft',
  glassSaturation: 'vivid',
  glassBorder: 'visible',
  glassHighlight: 'soft',
  glassDepth: 'raised',
};

const liquidGlassPresets: Record<PaperLiquidGlassPreset, PaperGlassOptions> = {
  subtle: {
    glassBlur: 'sm',
    glassTint: 'neutral',
    glassOpacity: 'faint',
    glassSaturation: 'normal',
    glassBorder: 'subtle',
    glassHighlight: 'soft',
    glassDepth: 'flat',
  },
  frosted: defaultGlassOptions,
  crystal: {
    glassBlur: 'lg',
    glassTint: 'cool',
    glassOpacity: 'soft',
    glassSaturation: 'intense',
    glassBorder: 'bright',
    glassHighlight: 'medium',
    glassDepth: 'raised',
  },
  floating: {
    glassBlur: 'xl',
    glassTint: 'primary',
    glassOpacity: 'medium',
    glassSaturation: 'intense',
    glassBorder: 'bright',
    glassHighlight: 'strong',
    glassDepth: 'floating',
  },
};

const elevationClasses: Record<PaperElevation, string> = {
  0: 'elevated-0',
  1: 'elevated-1',
  2: 'elevated-2',
  3: 'elevated-3',
  4: 'elevated-4',
  5: 'elevated-5',
  6: 'elevated-6',
  7: 'elevated-7',
};

const radiusClasses: Record<PaperRadius, string> = {
  none: 'rounded-none',
  xs: 'rounded-sm',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const paddingClasses: Record<PaperPadding, string> = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const borderClasses: Record<PaperBorder, string> = {
  none: '',
  subtle: 'border border-paper-800',
  default: 'border border-paper-700',
  strong: 'border border-paper-500',
};

const glassBlurClasses: Record<PaperGlassBlur, string> = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

const glassTintClasses: Record<PaperGlassTint, Record<PaperGlassOpacity, string>> = {
  neutral: {
    faint: 'bg-white/[0.04]',
    soft: 'bg-white/[0.08]',
    medium: 'bg-white/[0.12]',
    strong: 'bg-white/[0.16]',
  },
  cool: {
    faint: 'bg-sky-100/[0.05]',
    soft: 'bg-sky-100/[0.09]',
    medium: 'bg-sky-100/[0.13]',
    strong: 'bg-sky-100/[0.18]',
  },
  warm: {
    faint: 'bg-amber-100/[0.05]',
    soft: 'bg-amber-100/[0.09]',
    medium: 'bg-amber-100/[0.13]',
    strong: 'bg-amber-100/[0.18]',
  },
  primary: {
    faint: 'bg-primary-100/[0.05]',
    soft: 'bg-primary-100/[0.09]',
    medium: 'bg-primary-100/[0.13]',
    strong: 'bg-primary-100/[0.18]',
  },
};

const glassSaturationClasses: Record<PaperGlassSaturation, string> = {
  normal: 'backdrop-saturate-100',
  vivid: 'backdrop-saturate-150',
  intense: 'backdrop-saturate-200',
};

const glassBorderClasses: Record<PaperGlassBorder, string> = {
  none: 'border border-transparent',
  subtle: 'border border-white/10',
  visible: 'border border-white/20',
  bright: 'border border-white/30',
};

const glassHighlightClasses: Record<PaperGlassHighlight, string> = {
  none: 'before:opacity-0 after:opacity-0',
  soft: 'before:opacity-30 after:opacity-20',
  medium: 'before:opacity-50 after:opacity-30',
  strong: 'before:opacity-70 after:opacity-50',
};

const glassDepthClasses: Record<PaperGlassDepth, string> = {
  flat: 'drop-shadow-none',
  raised: 'drop-shadow-lg',
  floating: 'drop-shadow-2xl',
};

const glassOverlayClasses = [
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
  'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_28%,transparent_56%)]',
  'before:mix-blend-screen before:transition-opacity before:duration-200',
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
  'after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_46%)]',
  'after:mix-blend-screen after:transition-opacity after:duration-200',
];

const getGlassOptions = ({
  liquidGlassPreset = 'frosted',
  glassBlur,
  glassTint,
  glassOpacity,
  glassSaturation,
  glassBorder,
  glassHighlight,
  glassDepth,
}: Pick<
  PaperProps,
  | 'liquidGlassPreset'
  | 'glassBlur'
  | 'glassTint'
  | 'glassOpacity'
  | 'glassSaturation'
  | 'glassBorder'
  | 'glassHighlight'
  | 'glassDepth'
>): PaperGlassOptions => ({
  ...liquidGlassPresets[liquidGlassPreset],
  ...(glassBlur && { glassBlur }),
  ...(glassTint && { glassTint }),
  ...(glassOpacity && { glassOpacity }),
  ...(glassSaturation && { glassSaturation }),
  ...(glassBorder && { glassBorder }),
  ...(glassHighlight && { glassHighlight }),
  ...(glassDepth && { glassDepth }),
});

const Paper = forwardRef<HTMLElement, PaperProps>(
  (
    {
      children,
      className,
      component = 'div',
      variant = 'plain',
      elevation = 0,
      radius = 'md',
      padding = 'md',
      border = 'none',
      backgroundClassName,
      borderClassName,
      liquidGlassPreset = 'frosted',
      glassBlur,
      glassTint,
      glassOpacity,
      glassSaturation,
      glassBorder,
      glassHighlight,
      glassDepth,
      ...props
    },
    ref,
  ) => {
    const Component = component as ElementType;
    const glassOptions = getGlassOptions({
      liquidGlassPreset,
      glassBlur,
      glassTint,
      glassOpacity,
      glassSaturation,
      glassBorder,
      glassHighlight,
      glassDepth,
    });

    const resolvedBackgroundClassName =
      backgroundClassName ??
      (variant === 'glass' ? glassTintClasses[glassOptions.glassTint][glassOptions.glassOpacity] : 'bg-paper-800');
    const resolvedBorderClassName =
      borderClassName ?? (variant === 'glass' ? glassBorderClasses[glassOptions.glassBorder] : borderClasses[border]);

    return (
      <Component
        ref={ref}
        className={clsx(
          'relative isolate box-border transition-[background-color,border-color,box-shadow,filter,backdrop-filter] duration-200 ease-out',
          radiusClasses[radius],
          paddingClasses[padding],
          elevationClasses[elevation],
          resolvedBackgroundClassName,
          resolvedBorderClassName,
          variant === 'glass' && [
            'text-paper-50 overflow-hidden bg-clip-padding',
            'supports-[backdrop-filter]:backdrop-brightness-110',
            glassBlurClasses[glassOptions.glassBlur],
            glassSaturationClasses[glassOptions.glassSaturation],
            glassHighlightClasses[glassOptions.glassHighlight],
            glassDepthClasses[glassOptions.glassDepth],
            glassOverlayClasses,
          ],
          className,
        )}
        data-elevation={elevation}
        data-liquid-glass-preset={variant === 'glass' ? liquidGlassPreset : undefined}
        data-variant={variant}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Paper.displayName = 'Paper';

export default Paper;
