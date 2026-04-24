import type { WheelPartLayout } from './types';

const BASE_WHEEL_SIZE = 800;
const CANVAS_OVERSCAN_MULTIPLIER = 1.3;

export const createWheelLayout = (targetWheelSize: number): WheelPartLayout => {
  const safeWheelSize = Math.max(160, Math.round(targetWheelSize));
  const canvasSize = Math.round(safeWheelSize * CANVAS_OVERSCAN_MULTIPLIER);
  const overflowPadding = (canvasSize - safeWheelSize) / 2;

  return {
    targetWheelSize: safeWheelSize,
    canvasSize,
    center: canvasSize / 2,
    wheelRadius: safeWheelSize / 2,
    scale: safeWheelSize / BASE_WHEEL_SIZE,
    overflowPadding,
  };
};
