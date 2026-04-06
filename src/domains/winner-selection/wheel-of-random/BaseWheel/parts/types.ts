import type { ComponentType, Ref } from 'react';
import type { ID } from '@components/Bracket/components/model';
import type { WheelItem, WheelItemWithAngle } from '@models/wheel.model';
import type { SpinParams, SpinResult } from '../contracts';

export interface WheelPartLayout {
  targetWheelSize: number;
  canvasSize: number;
  center: number;
  wheelRadius: number;
  scale: number;
  overflowPadding: number;
}

export interface SpinningWheelProps {
  layout: WheelPartLayout;
  items: WheelItemWithAngle[];
  highlightedItemId?: ID | null;
  onRotationChange?: (rotation: number) => void;
  wheelRef?: Ref<SpinningWheelHandle>;
}

export interface SpinningWheelHandle {
  spin: (params: SpinParams) => SpinResult;
  setRotation: (rotation: number) => void;
  getRotation: () => number;
  redraw: () => void;
  eatAnimation: (id: WheelItem['id'], duration?: number) => Promise<void>;
  setSpeedMultiplier: (multiplier: number) => void;
}

export interface PointerProps {
  layout: WheelPartLayout;
}

export interface EffectsProps {
  layout: WheelPartLayout;
  isSpinning: boolean;
}

export type SpinningWheelComponent = ComponentType<SpinningWheelProps>;

export interface ResolvedWheelParts {
  spinningWheel: SpinningWheelComponent;
  pointer: ComponentType<PointerProps> | null;
  effects: ComponentType<EffectsProps> | null;
}
