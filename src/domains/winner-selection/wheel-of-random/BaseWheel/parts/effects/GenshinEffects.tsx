import { useEffect, useRef } from 'react';

import { EffectsManager } from '../../effects';

import type { EffectsProps } from '../types';

const resizeCanvas = (canvas: HTMLCanvasElement | null, size: number): void => {
  if (!canvas) {
    return;
  }

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
};

const GenshinEffects = ({ layout, isSpinning }: EffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<EffectsManager | null>(null);

  useEffect(() => {
    resizeCanvas(canvasRef.current, layout.canvasSize);
  }, [layout.canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (!managerRef.current) {
      managerRef.current = new EffectsManager(canvas, {
        centerX: layout.center,
        centerY: layout.center,
        wheelRadius: layout.wheelRadius,
        canvasWidth: layout.canvasSize,
        canvasHeight: layout.canvasSize,
      });
    } else {
      managerRef.current.updateConfig({
        centerX: layout.center,
        centerY: layout.center,
        wheelRadius: layout.wheelRadius,
        canvasWidth: layout.canvasSize,
        canvasHeight: layout.canvasSize,
      });
    }

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [layout.canvasSize, layout.center, layout.wheelRadius]);

  useEffect(() => {
    managerRef.current?.setSpeedMultiplier(isSpinning ? 5 : 1);
  }, [isSpinning]);

  useEffect(() => {
    let frameId: number | null = null;
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const manager = managerRef.current;

      if (!ctx || !manager) {
        return;
      }

      const deltaTime = lastTimestamp == null ? 16.67 : timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      ctx.clearRect(0, 0, layout.canvasSize, layout.canvasSize);
      manager.renderFrame(deltaTime, timestamp);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
      lastTimestamp = null;
    };
  }, [layout.canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      style={{
        position: 'absolute',
        inset: 0,
        left: `${-layout.overflowPadding}px`,
        top: `${-layout.overflowPadding}px`,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default GenshinEffects;
