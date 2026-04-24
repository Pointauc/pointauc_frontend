import type { RefObject } from 'react';
import type { WheelItem, WheelItemWithAngle, WheelStyle } from '@models/wheel.model';

export interface WheelRendererCanvasRefs {
  wheelCanvas: RefObject<HTMLCanvasElement | null>;
  foregroundCanvas: RefObject<HTMLCanvasElement | null>;
}

export interface WheelRendererLayout {
  targetWheelSize: number;
  canvasSize: number;
  center: number;
  wheelRadius: number;
  scale: number;
  overflowPadding: number;
}

export interface WheelRendererDrawOptions {
  getColor?: (item: WheelItem) => string;
}

export interface WheelRenderer {
  setItems(items: WheelItem[]): void;
  getItems(): WheelItemWithAngle[];
  setLayout(targetWheelSize: number): void;
  getLayout(): WheelRendererLayout | null;
  setRotation(rotation: number): void;
  getRotation(): number;
  draw(options?: WheelRendererDrawOptions): void;
  highlightItem(id: WheelItem['id']): void;
  eatAnimation(id: WheelItem['id'], duration?: number): Promise<void>;
  setSpeedMultiplier(multiplier: number): void;
  hasEffects(): boolean;
  destroy(): void;
}

export interface WheelRendererFactory {
  create: (canvasRefs: WheelRendererCanvasRefs) => WheelRenderer;
  hasEffects: boolean;
}

export type WheelRendererRegistry = Record<WheelStyle, WheelRendererFactory>;
