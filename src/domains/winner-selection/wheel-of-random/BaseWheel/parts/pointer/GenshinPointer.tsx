import { useEffect, useRef } from 'react';

import type { PointerProps } from '../types';

const resizeCanvas = (canvas: HTMLCanvasElement | null, size: number): void => {
  if (!canvas) {
    return;
  }

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
};

const GenshinPointer = ({ layout }: PointerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    resizeCanvas(canvasRef.current, layout.canvasSize);
  }, [layout.canvasSize]);

  useEffect(() => {
    let frameId: number | null = null;

    const draw = (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.clearRect(0, 0, layout.canvasSize, layout.canvasSize);

      const baseWidth = 36;
      const baseHeight = 60;
      const sizeMultiplier = 1.4 * layout.scale;
      const pointerWidth = baseWidth * sizeMultiplier;
      const pointerHeight = baseHeight * sizeMultiplier;
      const pointerX = layout.center;
      const pointerY = layout.overflowPadding + layout.scale * 17 - 35 * layout.scale;
      const currentTime = timestamp * 0.001;

      ctx.save();

      // Main crystal gradient - celestial blue to deep purple
      const mainGradient = ctx.createLinearGradient(
        pointerX - pointerWidth / 2,
        pointerY,
        pointerX + pointerWidth / 2,
        pointerY + pointerHeight,
      );
      mainGradient.addColorStop(0, '#E0F2FE'); // Light cyan
      mainGradient.addColorStop(0.2, '#38BDF8'); // Bright blue
      mainGradient.addColorStop(0.5, '#3B82F6'); // Royal blue
      mainGradient.addColorStop(0.8, '#6366F1'); // Indigo
      mainGradient.addColorStop(1, '#8B5CF6'); // Purple

      // Outer glow effect
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 20 * sizeMultiplier;
      ctx.shadowColor = '#60A5FA';

      // Draw main crystal blade shape
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      // Crystal point at bottom
      ctx.moveTo(pointerX, pointerY + pointerHeight);
      // Left facet
      ctx.lineTo(pointerX - pointerWidth / 3, pointerY + pointerHeight * 0.6);
      ctx.lineTo(pointerX - pointerWidth / 2, pointerY + pointerHeight * 0.3);
      // Left shoulder
      ctx.lineTo(pointerX - pointerWidth / 2.5, pointerY + pointerHeight * 0.15);
      // Top left facet
      ctx.lineTo(pointerX - pointerWidth / 4, pointerY + pointerHeight * 0.05);
      // Crystal crown
      ctx.lineTo(pointerX - pointerWidth / 6, pointerY);
      ctx.lineTo(pointerX, pointerY - 3 * sizeMultiplier);
      ctx.lineTo(pointerX + pointerWidth / 6, pointerY);
      // Top right facet
      ctx.lineTo(pointerX + pointerWidth / 4, pointerY + pointerHeight * 0.05);
      // Right shoulder
      ctx.lineTo(pointerX + pointerWidth / 2.5, pointerY + pointerHeight * 0.15);
      // Right facet
      ctx.lineTo(pointerX + pointerWidth / 2, pointerY + pointerHeight * 0.3);
      ctx.lineTo(pointerX + pointerWidth / 3, pointerY + pointerHeight * 0.6);
      ctx.closePath();
      ctx.fill();

      // Reset shadow for inner elements
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Inner crystal facets with lighter gradient
      const innerGradient = ctx.createLinearGradient(
        pointerX - pointerWidth / 4,
        pointerY + pointerHeight * 0.1,
        pointerX + pointerWidth / 4,
        pointerY + pointerHeight * 0.7,
      );
      innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      innerGradient.addColorStop(0.3, 'rgba(147, 197, 253, 0.6)');
      innerGradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.4)');
      innerGradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY + pointerHeight * 0.85);
      ctx.lineTo(pointerX - pointerWidth / 5, pointerY + pointerHeight * 0.5);
      ctx.lineTo(pointerX - pointerWidth / 4, pointerY + pointerHeight * 0.25);
      ctx.lineTo(pointerX, pointerY + pointerHeight * 0.1);
      ctx.lineTo(pointerX + pointerWidth / 4, pointerY + pointerHeight * 0.25);
      ctx.lineTo(pointerX + pointerWidth / 5, pointerY + pointerHeight * 0.5);
      ctx.closePath();
      ctx.fill();

      // Crystal outline with golden accents
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5 * sizeMultiplier;
      ctx.beginPath();
      ctx.moveTo(pointerX, pointerY + pointerHeight);
      ctx.lineTo(pointerX - pointerWidth / 3, pointerY + pointerHeight * 0.6);
      ctx.lineTo(pointerX - pointerWidth / 2, pointerY + pointerHeight * 0.3);
      ctx.lineTo(pointerX - pointerWidth / 2.5, pointerY + pointerHeight * 0.15);
      ctx.lineTo(pointerX - pointerWidth / 4, pointerY + pointerHeight * 0.05);
      ctx.lineTo(pointerX - pointerWidth / 6, pointerY);
      ctx.lineTo(pointerX, pointerY - 3 * sizeMultiplier);
      ctx.lineTo(pointerX + pointerWidth / 6, pointerY);
      ctx.lineTo(pointerX + pointerWidth / 4, pointerY + pointerHeight * 0.05);
      ctx.lineTo(pointerX + pointerWidth / 2.5, pointerY + pointerHeight * 0.15);
      ctx.lineTo(pointerX + pointerWidth / 2, pointerY + pointerHeight * 0.3);
      ctx.lineTo(pointerX + pointerWidth / 3, pointerY + pointerHeight * 0.6);
      ctx.lineTo(pointerX, pointerY + pointerHeight);
      ctx.stroke();

      // Inner crystal facet lines
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 0.8 * sizeMultiplier;
      ctx.beginPath();
      // Vertical center line
      ctx.moveTo(pointerX, pointerY + pointerHeight * 0.1);
      ctx.lineTo(pointerX, pointerY + pointerHeight * 0.85);
      // Left facet line
      ctx.moveTo(pointerX - pointerWidth / 5, pointerY + pointerHeight * 0.5);
      ctx.lineTo(pointerX, pointerY + pointerHeight * 0.1);
      // Right facet line
      ctx.moveTo(pointerX + pointerWidth / 5, pointerY + pointerHeight * 0.5);
      ctx.lineTo(pointerX, pointerY + pointerHeight * 0.1);
      ctx.stroke();

      // Magical crown gem at the top
      const gemSize = 6 * sizeMultiplier;
      const gemGradient = ctx.createRadialGradient(
        pointerX - gemSize * 0.3,
        pointerY - gemSize * 0.3,
        0,
        pointerX,
        pointerY,
        gemSize,
      );
      gemGradient.addColorStop(0, '#FEF3C7'); // Light gold
      gemGradient.addColorStop(0.3, '#F59E0B'); // Amber
      gemGradient.addColorStop(0.7, '#D97706'); // Orange
      gemGradient.addColorStop(1, '#92400E'); // Dark amber

      ctx.fillStyle = gemGradient;
      ctx.beginPath();
      ctx.arc(pointerX, pointerY - 3 * sizeMultiplier, gemSize, 0, 2 * Math.PI);
      ctx.fill();

      // Gem highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(pointerX - gemSize * 0.3, pointerY - 3 * sizeMultiplier - gemSize * 0.3, gemSize * 0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Gem border
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1 * sizeMultiplier;
      ctx.beginPath();
      ctx.arc(pointerX, pointerY - 3 * sizeMultiplier, gemSize, 0, 2 * Math.PI);
      ctx.stroke();

      // Floating magical particles around the pointer
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 + currentTime * 0.5;
        const distance = 25 * sizeMultiplier + Math.sin(currentTime * 2 + i) * 8 * sizeMultiplier;
        const particleX = pointerX + Math.cos(angle) * distance;
        const particleY = pointerY + pointerHeight * 0.3 + Math.sin(angle) * distance * 0.5;

        const particleSize = (2 + Math.sin(currentTime * 3 + i * 2)) * sizeMultiplier;

        // Particle glow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8 * sizeMultiplier;
        ctx.shadowColor = '#60A5FA';

        ctx.fillStyle = '#BFDBFE';
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Particle core
        ctx.fillStyle = '#DBEAFE';
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize * 0.6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Energy trails/wisps
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.lineWidth = 2 * sizeMultiplier;
      for (let i = 0; i < 3; i++) {
        const wispOffset = Math.sin(2 + i * Math.PI * 0.7) * 15 * sizeMultiplier;
        ctx.beginPath();
        ctx.moveTo(pointerX + wispOffset, pointerY + pointerHeight * 0.4);
        ctx.quadraticCurveTo(
          pointerX + wispOffset * 2,
          pointerY + pointerHeight * 0.6,
          pointerX + wispOffset * 0.5,
          pointerY + pointerHeight * 0.8,
        );
        ctx.stroke();
      }

      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [layout]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      style={{
        position: 'absolute',
        inset: 0,
        left: `${-layout.overflowPadding}px`,
        top: `${-layout.overflowPadding}px`,
        zIndex: 3,
        pointerEvents: 'none',
      }}
    />
  );
};

export default GenshinPointer;
