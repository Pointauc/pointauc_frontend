import { forwardRef, type ElementType, useId, useMemo } from 'react';
import clsx from 'clsx';

import LiquidGlassFilter from './LiquidGlassFilter';
import {
  getGlassOptions,
  getLiquidGlassStyle,
  glassBlurClasses,
  glassBorderClasses,
  glassDepthClasses,
  glassHighlightClasses,
  glassOverlayClasses,
  glassProgressiveBlurLayerClasses,
  glassRefractionLayerClasses,
  glassSaturationClasses,
} from './liquidGlass';
import { createLiquidGlassDisplacementMap } from './liquidGlassDisplacement';

import type { PaperBorder, PaperElevation, PaperPadding, PaperProps, PaperRadius } from './Paper.types';

export type {
  PaperBorder,
  PaperComponent,
  PaperElevation,
  PaperPadding,
  PaperProps,
  PaperRadius,
  PaperVariant,
} from './Paper.types';

export type {
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
      style,
      ...props
    },
    ref,
  ) => {
    const Component = component as ElementType;
    const rawFilterId = useId();
    const liquidGlassFilterId = `paper-liquid-glass-${rawFilterId.replace(/:/g, '')}`;
    const isGlass = variant === 'glass';
    const glassOptions = useMemo(
      () =>
        getGlassOptions({
          liquidGlassPreset,
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
        }),
      [
        liquidGlassPreset,
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
      ],
    );
    const displacementMap = useMemo(
      () => (isGlass ? createLiquidGlassDisplacementMap(glassOptions) : ''),
      [glassOptions, isGlass],
    );
    const liquidGlassStyle = useMemo(
      () => (isGlass ? getLiquidGlassStyle(liquidGlassFilterId, glassOptions) : undefined),
      [glassOptions, isGlass, liquidGlassFilterId],
    );
    const componentStyle = isGlass ? { ...liquidGlassStyle, ...style } : style;
    const resolvedBackgroundClassName =
      backgroundClassName ?? (isGlass ? 'bg-[var(--paper-liquid-glass-background)]' : 'bg-paper-800');
    const resolvedBorderClassName =
      borderClassName ?? (isGlass ? glassBorderClasses[glassOptions.glassBorder] : borderClasses[border]);

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
          isGlass && [
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
        data-glass-surface={isGlass ? glassOptions.glassSurface : undefined}
        data-liquid-glass-preset={isGlass ? liquidGlassPreset : undefined}
        data-variant={variant}
        style={componentStyle}
        {...props}
      >
        {isGlass && (
          <>
            <LiquidGlassFilter
              filterId={liquidGlassFilterId}
              displacementMap={displacementMap}
              glassOptions={glassOptions}
            />
            <span aria-hidden='true' className={clsx(glassRefractionLayerClasses)} />
            <span aria-hidden='true' className={clsx(glassProgressiveBlurLayerClasses)} />
          </>
        )}
        {children}
      </Component>
    );
  },
);

Paper.displayName = 'Paper';

export default Paper;
