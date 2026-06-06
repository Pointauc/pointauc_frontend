import type { HTMLAttributes, ReactNode } from 'react';
import type {
  PaperGlassBlur,
  PaperGlassBorder,
  PaperGlassDepth,
  PaperGlassHighlight,
  PaperGlassOpacity,
  PaperGlassSaturation,
  PaperGlassSurface,
  PaperGlassTint,
  PaperLiquidGlassPreset,
} from './liquidGlass';

export type PaperVariant = 'plain' | 'glass';
export type PaperElevation = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PaperRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type PaperPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PaperBorder = 'none' | 'subtle' | 'default' | 'strong';
export type PaperComponent = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'li';

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  /** Content rendered inside the paper surface. It does not add layout styles by itself. */
  children?: ReactNode;

  /** HTML element used for the outer surface. Pick the semantic tag without changing the default visual style. */
  component?: PaperComponent;

  /** Visual treatment of the surface. `plain` uses a solid paper background, while `glass` adds translucent blur, tint, refraction, and light overlays. */
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

  /** Glass-only preset that sets all glass controls together. Individual glass props override the selected preset. */
  liquidGlassPreset?: PaperLiquidGlassPreset;

  /** Glass-only fallback backdrop blur amount. This remains useful in browsers that do not support SVG filters as `backdrop-filter`. */
  glassBlur?: PaperGlassBlur;

  /** Glass-only color family for the translucent surface tint. Pair with `glassOpacity` or `glassBackgroundOpacity` to control the visible cast. */
  glassTint?: PaperGlassTint;

  /** Glass-only preset tint intensity. `glassBackgroundOpacity` overrides this with a numeric opacity when finer control is needed. */
  glassOpacity?: PaperGlassOpacity;

  /** Glass-only fallback backdrop saturation. Higher values make colors behind the surface feel brighter through the blur. */
  glassSaturation?: PaperGlassSaturation;

  /** Glass-only edge visibility. Higher values make the refractive border read as sharper and brighter. */
  glassBorder?: PaperGlassBorder;

  /** Glass-only sheen overlay strength. Higher values make the top light streak and radial glow more pronounced. */
  glassHighlight?: PaperGlassHighlight;

  /** Glass-only drop-shadow depth. Higher values make the glass appear to float farther above the background. */
  glassDepth?: PaperGlassDepth;

  /** Glass-only virtual lens profile used to generate the SVG displacement map. Squircle is the smoothest panel-like shape; lip creates a raised rim and shallow inner dip. */
  glassSurface?: PaperGlassSurface;

  /** Glass-only refractive rim width as a percentage-like value of the panel's shorter side. Higher values bend more of the card interior near the edge. */
  glassBezelWidth?: number;

  /** Glass-only simulated lens thickness. Higher values make the displacement map and specular lighting feel stronger. */
  glassThickness?: number;

  /** Glass-only SVG displacement strength. Set to `0` for a non-refractive translucent glass panel while keeping the blur/tint fallback. */
  glassRefractionLevel?: number;

  /** Glass-only additional blur level used by the SVG/backdrop enhancement. This is separate from the broad fallback `glassBlur` class. */
  glassBlurLevel?: number;

  /** Glass-only specular highlight opacity. Higher values make the generated rim light more visible. */
  glassSpecularOpacity?: number;

  /** Glass-only specular highlight saturation/exponent. Higher values make the shine tighter and punchier. */
  glassSpecularSaturation?: number;

  /** Glass-only light direction in degrees for the generated specular highlight. */
  glassSpecularAngle?: number;

  /** Glass-only progressive blur strength. Higher values add more top-weighted softening over the refracted surface. */
  glassProgressiveBlur?: number;

  /** Glass-only numeric tint opacity from `0` to `1`. Overrides the string-based `glassOpacity` scale. */
  glassBackgroundOpacity?: number;

  /** Glass-only displacement map resolution. Higher values can look smoother but create a larger inline SVG data URL. */
  glassDisplacementMapResolution?: number;
}
