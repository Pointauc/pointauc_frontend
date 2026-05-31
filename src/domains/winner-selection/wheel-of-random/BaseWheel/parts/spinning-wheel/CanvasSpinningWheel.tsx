import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, type FC } from 'react';
import tinycolor from 'tinycolor2';

import { calculateWinnerSpinDistance } from '@domains/winner-selection/wheel-of-random/lib/geometry';
import { WheelItem, WheelItemWithAngle } from '@models/wheel.model';
import { getSafeIndex2 } from '@utils/dataType/array';
import { Ease, interpolate } from '@utils/dataType/function.utils';

import classes from '../../BaseWheel.module.css';
import { useWheelAnimator } from '../../hooks/useWheelAnimator';
import { CanvasCache } from '../../renderers/CanvasCache';

import type { SpinParams } from '../../contracts';
import type { SpinningWheelProps, WheelPartLayout } from '../types';

interface CanvasWheelRenderHelpers {
  layout: WheelPartLayout;
  scale: (value: number) => number;
}

interface CanvasSpinningWheelRenderer {
  beforeDraw?: (ctx: CanvasRenderingContext2D, items: WheelItemWithAngle[], helpers: CanvasWheelRenderHelpers) => void;
  afterDraw?: (ctx: CanvasRenderingContext2D, items: WheelItemWithAngle[], helpers: CanvasWheelRenderHelpers) => void;
  drawText: (ctx: CanvasRenderingContext2D, item: WheelItemWithAngle, helpers: CanvasWheelRenderHelpers) => void;
  drawSlice: (
    ctx: CanvasRenderingContext2D,
    item: WheelItemWithAngle,
    getColor: (item: WheelItem) => string,
    helpers: CanvasWheelRenderHelpers,
  ) => void;
}

interface CanvasSpinningWheelProps extends SpinningWheelProps {
  renderer: CanvasSpinningWheelRenderer;
}

const clearCanvas = (ctx: CanvasRenderingContext2D, canvasSize: number): void => {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
};

const resizeCanvas = (canvas: HTMLCanvasElement | null, size: number): void => {
  if (!canvas) {
    return;
  }

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
};

const CanvasSpinningWheel: FC<CanvasSpinningWheelProps> = ({
  layout,
  items,
  highlightedItemId,
  onRotationChange,
  renderer,
  wheelRef,
}: CanvasSpinningWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const itemsRef = useRef(items);
  const canvasCacheRef = useRef(new CanvasCache());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const helpers = useMemo<CanvasWheelRenderHelpers>(
    () => ({
      layout,
      scale: (value: number) => layout.scale * value,
    }),
    [layout],
  );

  const getColor = useCallback(
    (item: WheelItem) =>
      highlightedItemId == null || item.id === highlightedItemId
        ? item.color || '#000'
        : tinycolor(item.color).greyscale().toHexString(),
    [highlightedItemId],
  );

  const drawItems = useCallback(
    (ctx: CanvasRenderingContext2D, itemsToDraw: WheelItemWithAngle[], colorResolver: (item: WheelItem) => string) => {
      clearCanvas(ctx, layout.canvasSize);
      renderer.beforeDraw?.(ctx, itemsToDraw, helpers);
      itemsToDraw.forEach((item) => renderer.drawSlice(ctx, item, colorResolver, helpers));
      itemsToDraw.forEach((item) => renderer.drawText(ctx, item, helpers));
      renderer.afterDraw?.(ctx, itemsToDraw, helpers);
    },
    [helpers, layout.canvasSize, renderer],
  );

  const drawWheelFromCache = useCallback(
    (rotation = rotationRef.current): void => {
      const ctx = canvasRef.current?.getContext('2d');
      const cachedCanvas = canvasCacheRef.current.canvas;

      if (!ctx || !cachedCanvas) {
        return;
      }

      clearCanvas(ctx, layout.canvasSize);
      ctx.save();
      ctx.translate(layout.center, layout.center);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(cachedCanvas, -layout.center, -layout.center);
      ctx.restore();
    },
    [layout.canvasSize, layout.center],
  );

  const redraw = useCallback((): void => {
    resizeCanvas(canvasRef.current, layout.canvasSize);
    canvasCacheRef.current.resize(layout.canvasSize);
    drawItems(canvasCacheRef.current.context, itemsRef.current, getColor);
    drawWheelFromCache();
  }, [drawItems, drawWheelFromCache, getColor, layout.canvasSize]);

  const setRotation = useCallback(
    (rotation: number): void => {
      rotationRef.current = rotation;
      drawWheelFromCache(rotation);
      onRotationChange?.(rotation);
    },
    [drawWheelFromCache, onRotationChange],
  );

  const getCurrentRotation = useCallback(() => rotationRef.current, []);
  const { animate } = useWheelAnimator({ getCurrentRotation, setRotation, onSpin: () => undefined });

  useEffect(() => {
    redraw();
  }, [redraw]);

  const drawCollapsedItems = useCallback(
    (leftItem: WheelItemWithAngle, rightItem: WheelItemWithAngle, commonAngle: number, progress: number): void => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        return;
      }

      const involvedItems = [
        {
          ...leftItem,
          endAngle:
            commonAngle < leftItem.startAngle
              ? interpolate(leftItem.endAngle, commonAngle + 2 * Math.PI, progress, Ease.Quad)
              : interpolate(leftItem.endAngle, commonAngle, progress, Ease.Quad),
        },
        {
          ...rightItem,
          startAngle:
            commonAngle > rightItem.startAngle
              ? interpolate(rightItem.startAngle, commonAngle - 2 * Math.PI, progress, Ease.Quad)
              : interpolate(rightItem.startAngle, commonAngle, progress, Ease.Quad),
        },
      ];

      drawItems(ctx, involvedItems, (item) => item.color || '#000');
    },
    [drawItems],
  );

  useImperativeHandle(
    wheelRef,
    () => ({
      spin: ({ winnerId, duration, distance }: SpinParams) => {
        const initialDistance = rotationRef.current;
        const spinDistance = distance ?? calculateWinnerSpinDistance({ duration, winnerId, items: itemsRef.current });
        const distanceOffset = initialDistance % 360;
        const changedDistance = spinDistance - distanceOffset;

        return {
          changedDistance,
          initialDistance,
          animate: () => animate(changedDistance, duration).then(() => undefined),
        };
      },
      setRotation,
      getRotation: () => rotationRef.current,
      redraw,
      setSpeedMultiplier: () => undefined,
      eatAnimation: async (id: WheelItem['id'], duration = 500) => {
        const removedItemIndex = itemsRef.current.findIndex((item) => item.id === id);
        if (removedItemIndex === -1 || itemsRef.current.length < 2) {
          return;
        }

        const localRotation = ((rotationRef.current % 360) * Math.PI) / 180;
        let commonAngle = (3 * Math.PI) / 2 - localRotation;
        if (commonAngle < 0) {
          commonAngle += 2 * Math.PI;
        }

        const leftItem = itemsRef.current[getSafeIndex2(itemsRef.current, removedItemIndex - 1)];
        const rightItem = itemsRef.current[getSafeIndex2(itemsRef.current, removedItemIndex + 1)];

        await new Promise<void>((resolve) => {
          let startTime: number | null = null;

          const drawStep = (timestamp: number) => {
            if (!startTime) {
              startTime = timestamp;
              requestAnimationFrame(drawStep);
              return;
            }

            if (timestamp - startTime > duration) {
              drawCollapsedItems(leftItem, rightItem, commonAngle, 1);
              resolve();
              return;
            }

            const progress = (timestamp - startTime) / duration;
            drawCollapsedItems(leftItem, rightItem, commonAngle, progress);
            requestAnimationFrame(drawStep);
          };

          requestAnimationFrame(drawStep);
        });
      },
    }),
    [animate, drawCollapsedItems, redraw, setRotation],
  );

  return (
    <div className={classes.wheelCanvasWrapper} aria-hidden='true'>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          left: `${-layout.overflowPadding}px`,
          top: `${-layout.overflowPadding}px`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

CanvasSpinningWheel.displayName = 'CanvasSpinningWheel';

export default CanvasSpinningWheel;
