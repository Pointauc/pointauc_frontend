import type { CSSProperties } from 'react';

export type PaperLiquidGlassPreset = 'subtle' | 'frosted' | 'crystal' | 'floating';
export type PaperGlassBlur = 'sm' | 'md' | 'lg' | 'xl';
export type PaperGlassTint = 'neutral' | 'cool' | 'warm' | 'primary';
export type PaperGlassOpacity = 'faint' | 'soft' | 'medium' | 'strong';
export type PaperGlassSaturation = 'normal' | 'vivid' | 'intense';
export type PaperGlassBorder = 'none' | 'subtle' | 'visible' | 'bright';
export type PaperGlassHighlight = 'none' | 'soft' | 'medium' | 'strong';
export type PaperGlassDepth = 'flat' | 'raised' | 'floating';
export type PaperGlassSurface = 'convexCircle' | 'convexSquircle' | 'concave' | 'lip';

export interface PaperGlassOptions {
  glassBlur: PaperGlassBlur;
  glassTint: PaperGlassTint;
  glassOpacity: PaperGlassOpacity;
  glassSaturation: PaperGlassSaturation;
  glassBorder: PaperGlassBorder;
  glassHighlight: PaperGlassHighlight;
  glassDepth: PaperGlassDepth;
  glassSurface: PaperGlassSurface;
  glassBezelWidth: number;
  glassThickness: number;
  glassRefractionLevel: number;
  glassBlurLevel: number;
  glassSpecularOpacity: number;
  glassSpecularSaturation: number;
  glassSpecularAngle: number;
  glassProgressiveBlur: number;
  glassBackgroundOpacity?: number;
  glassDisplacementMapResolution: number;
}

export interface PaperGlassInputOptions {
  liquidGlassPreset?: PaperLiquidGlassPreset;
  glassBlur?: PaperGlassBlur;
  glassTint?: PaperGlassTint;
  glassOpacity?: PaperGlassOpacity;
  glassSaturation?: PaperGlassSaturation;
  glassBorder?: PaperGlassBorder;
  glassHighlight?: PaperGlassHighlight;
  glassDepth?: PaperGlassDepth;
  glassSurface?: PaperGlassSurface;
  glassBezelWidth?: number;
  glassThickness?: number;
  glassRefractionLevel?: number;
  glassBlurLevel?: number;
  glassSpecularOpacity?: number;
  glassSpecularSaturation?: number;
  glassSpecularAngle?: number;
  glassProgressiveBlur?: number;
  glassBackgroundOpacity?: number;
  glassDisplacementMapResolution?: number;
}

interface LiquidGlassStyle extends CSSProperties {
  '--paper-liquid-glass-background'?: string;
  '--paper-liquid-glass-filter'?: string;
  '--paper-liquid-glass-progressive-blur'?: string;
  '--paper-liquid-glass-progressive-opacity'?: number;
}

export const defaultGlassOptions: PaperGlassOptions = {
  glassBlur: 'md',
  glassTint: 'neutral',
  glassOpacity: 'soft',
  glassSaturation: 'vivid',
  glassBorder: 'visible',
  glassHighlight: 'soft',
  glassDepth: 'raised',
  glassSurface: 'convexSquircle',
  glassBezelWidth: 14,
  glassThickness: 0.85,
  glassRefractionLevel: 0.7,
  glassBlurLevel: 1,
  glassSpecularOpacity: 0.2,
  glassSpecularSaturation: 4,
  glassSpecularAngle: -60,
  glassProgressiveBlur: 0.6,
  glassDisplacementMapResolution: 48,
};

export const liquidGlassPresets: Record<PaperLiquidGlassPreset, PaperGlassOptions> = {
  subtle: {
    ...defaultGlassOptions,
    glassBlur: 'sm',
    glassOpacity: 'faint',
    glassSaturation: 'normal',
    glassBorder: 'subtle',
    glassDepth: 'flat',
    glassBezelWidth: 10,
    glassThickness: 0.55,
    glassRefractionLevel: 0.35,
    glassBlurLevel: 0.7,
    glassSpecularOpacity: 0.14,
    glassSpecularSaturation: 3,
    glassProgressiveBlur: 0.35,
  },
  frosted: defaultGlassOptions,
  crystal: {
    ...defaultGlassOptions,
    glassBlur: 'lg',
    glassTint: 'cool',
    glassSaturation: 'intense',
    glassBorder: 'bright',
    glassHighlight: 'medium',
    glassBezelWidth: 18,
    glassThickness: 1.1,
    glassRefractionLevel: 0.9,
    glassBlurLevel: 0.45,
    glassSpecularOpacity: 0.35,
    glassSpecularSaturation: 7,
    glassProgressiveBlur: 0.2,
  },
  floating: {
    ...defaultGlassOptions,
    glassBlur: 'xl',
    glassTint: 'primary',
    glassOpacity: 'medium',
    glassSaturation: 'intense',
    glassBorder: 'bright',
    glassHighlight: 'strong',
    glassDepth: 'floating',
    glassBezelWidth: 22,
    glassThickness: 1.25,
    glassRefractionLevel: 1,
    glassBlurLevel: 0.75,
    glassSpecularOpacity: 0.4,
    glassSpecularSaturation: 8,
    glassProgressiveBlur: 0.8,
  },
};

export const glassBlurClasses: Record<PaperGlassBlur, string> = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

export const glassSaturationClasses: Record<PaperGlassSaturation, string> = {
  normal: 'backdrop-saturate-100',
  vivid: 'backdrop-saturate-150',
  intense: 'backdrop-saturate-200',
};

export const glassBorderClasses: Record<PaperGlassBorder, string> = {
  none: 'border border-transparent',
  subtle: 'border border-white/10',
  visible: 'border border-white/20',
  bright: 'border border-white/30',
};

export const glassHighlightClasses: Record<PaperGlassHighlight, string> = {
  none: 'before:opacity-0 after:opacity-0',
  soft: 'before:opacity-30 after:opacity-20',
  medium: 'before:opacity-50 after:opacity-30',
  strong: 'before:opacity-70 after:opacity-50',
};

export const glassDepthClasses: Record<PaperGlassDepth, string> = {
  flat: 'drop-shadow-none',
  raised: 'drop-shadow-lg',
  floating: 'drop-shadow-2xl',
};

export const glassOverlayClasses = [
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
  'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_28%,transparent_56%)]',
  'before:mix-blend-screen before:transition-opacity before:duration-200',
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
  'after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_46%)]',
  'after:mix-blend-screen after:transition-opacity after:duration-200',
];

export const glassRefractionLayerClasses = [
  'pointer-events-none absolute inset-0 rounded-[inherit]',
  '[backdrop-filter:var(--paper-liquid-glass-filter)]',
  '[-webkit-backdrop-filter:var(--paper-liquid-glass-filter)]',
];

export const glassProgressiveBlurLayerClasses = [
  'pointer-events-none absolute inset-0 rounded-[inherit]',
  'opacity-[var(--paper-liquid-glass-progressive-opacity)]',
  'backdrop-blur-[var(--paper-liquid-glass-progressive-blur)]',
  '[mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.4)_48%,transparent_100%)]',
  '[-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.4)_48%,transparent_100%)]',
];

const glassOpacityValues: Record<PaperGlassOpacity, number> = {
  faint: 0.04,
  soft: 0.08,
  medium: 0.12,
  strong: 0.16,
};

const glassTintColors: Record<PaperGlassTint, string> = {
  neutral: 'rgb(255 255 255)',
  cool: 'rgb(224 242 254)',
  warm: 'rgb(254 243 199)',
  primary: 'var(--mantine-primary-color-1)',
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getGlassOptions = ({
  liquidGlassPreset = 'frosted',
  glassBlur,
  glassTint,
  glassOpacity,
  glassSaturation,
  glassBorder,
  glassHighlight,
  glassDepth,
  glassSurface,
  glassBezelWidth,
  glassThickness,
  glassRefractionLevel,
  glassBlurLevel,
  glassSpecularOpacity,
  glassSpecularSaturation,
  glassSpecularAngle,
  glassProgressiveBlur,
  glassBackgroundOpacity,
  glassDisplacementMapResolution,
}: PaperGlassInputOptions): PaperGlassOptions => ({
  ...liquidGlassPresets[liquidGlassPreset],
  ...(glassBlur && { glassBlur }),
  ...(glassTint && { glassTint }),
  ...(glassOpacity && { glassOpacity }),
  ...(glassSaturation && { glassSaturation }),
  ...(glassBorder && { glassBorder }),
  ...(glassHighlight && { glassHighlight }),
  ...(glassDepth && { glassDepth }),
  ...(glassSurface && { glassSurface }),
  ...(glassBezelWidth !== undefined && { glassBezelWidth }),
  ...(glassThickness !== undefined && { glassThickness }),
  ...(glassRefractionLevel !== undefined && { glassRefractionLevel }),
  ...(glassBlurLevel !== undefined && { glassBlurLevel }),
  ...(glassSpecularOpacity !== undefined && { glassSpecularOpacity }),
  ...(glassSpecularSaturation !== undefined && { glassSpecularSaturation }),
  ...(glassSpecularAngle !== undefined && { glassSpecularAngle }),
  ...(glassProgressiveBlur !== undefined && { glassProgressiveBlur }),
  ...(glassBackgroundOpacity !== undefined && { glassBackgroundOpacity }),
  ...(glassDisplacementMapResolution !== undefined && { glassDisplacementMapResolution }),
});

export const getLiquidGlassFilterScale = (options: PaperGlassOptions) => {
  return clamp(options.glassBezelWidth * options.glassThickness * options.glassRefractionLevel, 0, 64);
};

export const getLiquidGlassStyle = (filterId: string, options: PaperGlassOptions): LiquidGlassStyle => {
  const tintColor = glassTintColors[options.glassTint];
  const backgroundOpacity = clamp(options.glassBackgroundOpacity ?? glassOpacityValues[options.glassOpacity], 0, 1);
  const progressiveBlur = clamp(options.glassBlurLevel * options.glassProgressiveBlur, 0, 12);
  const filter = [
    `url(#${filterId})`,
    `blur(${clamp(options.glassBlurLevel, 0, 12)}px)`,
    `saturate(${options.glassSaturation === 'normal' ? 1 : options.glassSaturation === 'vivid' ? 1.5 : 2})`,
    'brightness(1.1)',
  ].join(' ');

  return {
    '--paper-liquid-glass-background': `color-mix(in srgb, ${tintColor} ${backgroundOpacity * 100}%, transparent)`,
    '--paper-liquid-glass-filter': filter,
    '--paper-liquid-glass-progressive-blur': `${progressiveBlur}px`,
    '--paper-liquid-glass-progressive-opacity': progressiveBlur > 0 ? 1 : 0,
  };
};
