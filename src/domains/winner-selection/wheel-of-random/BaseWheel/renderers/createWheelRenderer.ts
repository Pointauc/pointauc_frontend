import { DefaultWheelRenderer } from './DefaultWheelRenderer';
import { GenshinWheelRenderer } from './GenshinWheelRenderer';

import type { WheelStyle } from '@models/wheel.model';
import type { WheelRendererCanvasRefs, WheelRendererRegistry } from './types';

const rendererRegistry: WheelRendererRegistry = {
  default: {
    create: (canvasRefs: WheelRendererCanvasRefs) => new DefaultWheelRenderer(canvasRefs),
    hasEffects: false,
  },
  genshinImpact: {
    create: (canvasRefs: WheelRendererCanvasRefs) => new GenshinWheelRenderer(canvasRefs),
    hasEffects: true,
  },
};

export const resolveWheelStyle = (wheelStyle?: WheelStyle | null): WheelStyle => wheelStyle ?? 'default';

export const createWheelRenderer = (wheelStyle: WheelStyle | null | undefined, canvasRefs: WheelRendererCanvasRefs) =>
  rendererRegistry[resolveWheelStyle(wheelStyle)].create(canvasRefs);

export const wheelStyleHasEffects = (wheelStyle?: WheelStyle | null): boolean =>
  rendererRegistry[resolveWheelStyle(wheelStyle)].hasEffects;
