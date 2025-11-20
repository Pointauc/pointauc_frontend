import tinycolor from 'tinycolor2';
import { Key } from 'react';

import { WheelItem, WheelItemWithAngle } from '@models/wheel.model.ts';
import { fitText } from '@utils/common.utils.ts';
import { getSafeIndex2 } from '@utils/dataType/array.ts';
import { Ease, interpolate } from '@utils/dataType/function.utils.ts';

import { EffectsManager, CanvasUtils, AnimationManager } from '../effects';

type DrawWheelFunc = (props: {
  items: WheelItemWithAngle[];
  wheelCanvas: HTMLCanvasElement;
  pointerCanvas: HTMLCanvasElement;
  getColor?: (item: WheelItem) => string;
  clear?: boolean;
}) => void;

type HighlightItemFunc = (
  id: Key,
  items: WheelItemWithAngle[],
  wheelCanvas: HTMLCanvasElement,
  pointerCanvas: HTMLCanvasElement,
) => void;

type EatAnimationFunc = (
  id: Key,
  items: WheelItemWithAngle[],
  wheelCanvas: HTMLCanvasElement,
  pointerCanvas: HTMLCanvasElement,
  duration?: number,
) => Promise<void>;

type InitializeEffectsFunc = (effectsCanvas: HTMLCanvasElement, wheelCanvas: HTMLCanvasElement) => EffectsManager;

type UpdateEffectsFunc = (effectsManager: EffectsManager, wheelCanvas: HTMLCanvasElement) => void;

interface Result {
  drawWheel: DrawWheelFunc;
  highlightItem: HighlightItemFunc;
  eatAnimation: EatAnimationFunc;
  initializeEffects: InitializeEffectsFunc;
  updateEffects: UpdateEffectsFunc;
  destroy: () => void;
}

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;
const selectorAngle = (Math.PI / 2) * 3;
// Pointer size multiplier - adjust this to make the pointer bigger/smaller (default 1.4 = 40% larger)
const defaultPointerSizeMultiplier = 1.4;

let pointerAnimationFrame: number | null = null;

const colorGetter = (item: WheelItem) => item.color || '#000';

// Shared animation manager instance
let sharedAnimationManager: AnimationManager | null = null;

const getAnimationManager = (): AnimationManager => {
  if (!sharedAnimationManager) {
    sharedAnimationManager = new AnimationManager(60); // 60 FPS
  }
  return sharedAnimationManager;
};

export const genshinWheelDrawer = (): Result => {
  const drawText = (
    ctx: CanvasRenderingContext2D,
    center: number,
    { startAngle, endAngle, name }: WheelItemWithAngle,
  ): void => {
    if ((endAngle - startAngle) / Math.PI / 2 < 0.016) {
      return;
    }

    const radius = center - 3;
    const text = fitText(name, maxTextLength);
    const currentTime = Date.now() * 0.003;

    ctx.save();

    // Enhanced font with better styling
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textBaseline = 'middle';

    const offsetModifier = -text.length * 0.007 + 1.3;
    const textRadius = (radius - ctx.measureText(text).width) / offsetModifier;
    const centerAngle = endAngle - (endAngle - startAngle) / 2;
    const textCoords = {
      x: textRadius * Math.cos(centerAngle) + borderWidth,
      y: textRadius * Math.sin(centerAngle) + borderWidth,
    };

    ctx.translate(textCoords.x + radius, textCoords.y + radius);
    ctx.rotate(centerAngle);

    // Magical text outline with multiple layers for depth
    const outlineColors = [
      { color: 'rgba(0, 0, 0, 0.8)', width: 4 },
      { color: 'rgba(139, 92, 246, 0.6)', width: 3 },
      { color: 'rgba(59, 130, 246, 0.4)', width: 2 },
    ];

    // Draw multiple outline layers
    outlineColors.forEach(({ color, width }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, 0, 0);
    });

    // Main text with gradient fill
    const textGradient = ctx.createLinearGradient(0, -11, 0, 11);
    textGradient.addColorStop(0, '#FFFFFF');
    textGradient.addColorStop(0.3, '#F0F9FF');
    textGradient.addColorStop(0.7, '#E0F2FE');
    textGradient.addColorStop(1, '#BAE6FD');

    ctx.fillStyle = textGradient;

    // Add magical glow effect
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';

    ctx.fillText(text, 0, 0);

    // Reset shadow for additional effects
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Add subtle shimmer effect
    const shimmerIntensity = (Math.sin(currentTime * 2) + 1) / 2;
    if (shimmerIntensity > 0.7) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(shimmerIntensity - 0.7) * 0.4})`;
      ctx.fillText(text, 0, 0);
    }

    // Add small magical sparkles around longer text
    if (text.length > 14) {
      const sparkleCount = 3;
      const textWidth = ctx.measureText(text).width;

      for (let i = 0; i < sparkleCount; i++) {
        const sparkleX = -textWidth / 2 + (textWidth * i) / (sparkleCount - 1) + Math.sin(currentTime * 4 + i) * 5;
        const sparkleY = -15 + Math.cos(currentTime * 3 + i * 2) * 8;
        const sparkleSize = 1 + Math.sin(currentTime * 6 + i * 3) * 0.5;

        // Sparkle glow
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, 2 * Math.PI);
        ctx.fill();

        // Sparkle cross shape
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sparkleX - sparkleSize * 2, sparkleY);
        ctx.lineTo(sparkleX + sparkleSize * 2, sparkleY);
        ctx.moveTo(sparkleX, sparkleY - sparkleSize * 2);
        ctx.lineTo(sparkleX, sparkleY + sparkleSize * 2);
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    ctx.restore();
  };

  const drawSlice = (
    ctx: CanvasRenderingContext2D,
    center: number,
    item: WheelItemWithAngle,
    pieEdgeDefault?: { x: number; y: number },
    getColor = colorGetter,
  ): void => {
    const { startAngle, endAngle } = item;
    const baseColor = getColor(item);
    const pieEdge = pieEdgeDefault || { x: center, y: center };
    const radius = center - innerBorderWidth;
    const currentTime = Date.now() * 0.002;

    ctx.save();

    // Create magical gradient overlay
    const magicalGradient = ctx.createRadialGradient(center, center, radius * 0.3, center, center, radius);
    const tinyColor = tinycolor(baseColor);
    const lighterColor = tinyColor.clone().lighten(15).toString();
    const darkerColor = tinyColor.clone().darken(10).toString();

    magicalGradient.addColorStop(0, lighterColor);
    magicalGradient.addColorStop(0.4, baseColor);
    magicalGradient.addColorStop(0.8, darkerColor);
    magicalGradient.addColorStop(1, tinyColor.clone().darken(20).toString());

    // Draw main slice with magical gradient
    ctx.fillStyle = magicalGradient;
    ctx.beginPath();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    // Add crystalline facet effects
    const midAngle = (startAngle + endAngle) / 2;
    const angleSpan = endAngle - startAngle;

    // Only add facets if slice is large enough
    if (angleSpan > 0.002) {
      // Inner crystalline lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Radial facet lines
      const facetCount = Math.max(0, Math.floor(angleSpan * 3));
      for (let i = 1; i < facetCount; i++) {
        const facetAngle = startAngle + (angleSpan * i) / facetCount;
        const innerRadius = radius * 0.4;
        const outerRadius = radius * 0.9;

        ctx.beginPath();
        ctx.moveTo(center + Math.cos(facetAngle) * innerRadius, center + Math.sin(facetAngle) * outerRadius);
        ctx.lineTo(center + Math.cos(facetAngle) * outerRadius, center + Math.sin(facetAngle) * outerRadius);
        ctx.stroke();
      }

      // Concentric facet arcs
      for (let i = 1; i <= 2; i++) {
        const facetRadius = radius * (0.4 + i * 0.25);
        ctx.beginPath();
        ctx.arc(center, center, facetRadius, startAngle, endAngle);
        ctx.stroke();
      }
    }

    // Magical edge glow
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = tinyColor.clone().brighten(30).setAlpha(0.6).toString();

    // Draw glowing border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.lineTo(center + Math.cos(startAngle) * radius, center + Math.sin(startAngle) * radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.lineTo(center + Math.cos(endAngle) * radius, center + Math.sin(endAngle) * radius);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Add subtle magical particles for larger slices
    if (angleSpan > 0.5) {
      const particleCount = Math.floor(angleSpan * 2);
      for (let i = 0; i < particleCount; i++) {
        const particleAngle = startAngle + (angleSpan * (i + 0.5)) / particleCount;
        const particleRadius = radius * (0.6 + Math.sin(currentTime * 3 + i) * 0.1);
        const particleX = center + Math.cos(particleAngle) * particleRadius;
        const particleY = center + Math.sin(particleAngle) * particleRadius;
        const particleSize = 1 + Math.sin(currentTime * 4 + i * 2) * 0.5;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  const drawPointer = (
    ctx: CanvasRenderingContext2D,
    center: number,
    sizeMultiplier = defaultPointerSizeMultiplier,
  ): void => {
    const baseWidth = 32;
    const baseHeight = 55;
    const pointerWidth = baseWidth * sizeMultiplier;
    const pointerHeight = baseHeight * sizeMultiplier;
    const pointerX = center;
    const pointerY = borderWidth + 12;

    // Clear the pointer canvas
    ctx.clearRect(0, 0, center * 2, center * 2);

    // Save context for transformations
    ctx.save();

    // Genshin Impact inspired crystal pointer design
    const currentTime = Date.now() * 0.001; // For animation effects

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
  };

  const drawWheel: DrawWheelFunc = ({ items, wheelCanvas, pointerCanvas, getColor = colorGetter, clear = true }) => {
    const ctx = wheelCanvas.getContext('2d');
    const pointerCtx = pointerCanvas.getContext('2d');
    const radius = Number(wheelCanvas.width) / 2;

    if (ctx) {
      clear && ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
      items.forEach((item) => drawSlice(ctx, radius, item, undefined, getColor));
      items.forEach((item) => drawText(ctx, radius, item));

      // Ornate magical border design
      const currentTime = Date.now() * 0.003;
      const borderRadius = radius - borderWidth / 2;
      const innerRadius = radius - borderWidth;

      ctx.save();

      // Main border with magical gradient
      const borderGradient = ctx.createLinearGradient(0, 0, radius * 2, radius * 2);
      borderGradient.addColorStop(0, '#F59E0B'); // Amber
      borderGradient.addColorStop(0.25, '#3B82F6'); // Blue
      borderGradient.addColorStop(0.5, '#8B5CF6'); // Purple
      borderGradient.addColorStop(0.75, '#06B6D4'); // Cyan
      borderGradient.addColorStop(1, '#F59E0B'); // Back to amber

      // Multi-layered border
      const borderLayers = [
        { radius: borderRadius, width: 2, alpha: 0.8 },
        { radius: borderRadius - 3, width: 4, alpha: 1 },
        { radius: borderRadius - 6, width: 2, alpha: 0.6 },
      ];

      borderLayers.forEach(({ radius: layerRadius, width, alpha }) => {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = width;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';

        ctx.beginPath();
        ctx.arc(radius, radius, layerRadius, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // Reset shadow and alpha
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;

      // Inner crystalline ring
      const crystalCount = 24;
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.lineWidth = 1;

      for (let i = 0; i < crystalCount; i++) {
        const angle = (i * 2 * Math.PI) / crystalCount;
        const innerCrystalRadius = innerRadius - 5;
        const outerCrystalRadius = innerRadius + 5;

        // Alternating crystal lengths
        const crystalLength = i % 2 === 0 ? outerCrystalRadius : outerCrystalRadius - 3;

        ctx.beginPath();
        ctx.moveTo(radius + Math.cos(angle) * innerCrystalRadius, radius + Math.sin(angle) * innerCrystalRadius);
        ctx.lineTo(radius + Math.cos(angle) * crystalLength, radius + Math.sin(angle) * crystalLength);
        ctx.stroke();
      }

      // Magical energy inner gradient
      const energyGradient = ctx.createRadialGradient(radius, radius, innerRadius - 20, radius, radius, innerRadius);
      energyGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
      energyGradient.addColorStop(0.7, 'rgba(147, 197, 253, 0.1)');
      energyGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');

      ctx.fillStyle = energyGradient;
      ctx.beginPath();
      ctx.arc(radius, radius, innerRadius, 0, 2 * Math.PI);
      ctx.arc(radius, radius, innerRadius - 20, 0, 2 * Math.PI, true);
      ctx.fill();

      // Reset shadow effects
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      ctx.restore();
    }

    // Draw the pointer on the pointer canvas
    if (pointerCtx && !pointerAnimationFrame) {
      const callback = () => {
        drawPointer(pointerCtx, radius);
        pointerAnimationFrame = requestAnimationFrame(callback);
      };

      pointerAnimationFrame = requestAnimationFrame(callback);
    }
  };

  const highlightItem: HighlightItemFunc = (id, items, wheelCanvas, pointerCanvas) => {
    const getColor = (item: WheelItem) =>
      item.id === id ? item.color : tinycolor(item.color).greyscale().toHexString();

    drawWheel({ items, wheelCanvas, pointerCanvas, getColor });
  };

  const eatAnimation: EatAnimationFunc = (id, items, wheelCanvas, pointerCanvas, duration = 500) => {
    const removedItemIndex = items.findIndex((item) => item.id === id);

    const rotation = Number(wheelCanvas.style.transform.match(/\((.*)deg\)/)?.[1] ?? 0);

    const localRotation = ((rotation % 360) * Math.PI) / 180;
    let commonAngle = (3 * Math.PI) / 2 - localRotation;
    if (commonAngle < 0) commonAngle += 2 * Math.PI;

    const leftItem = items[getSafeIndex2(items, removedItemIndex - 1)];
    const rightItem = items[getSafeIndex2(items, removedItemIndex + 1)];

    return new Promise((resolve) => {
      let startTime: number | null = null;

      const draw = (progress: number) => {
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

        drawWheel({ items: involvedItems, wheelCanvas, pointerCanvas, clear: false });
      };

      const drawStep = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;

          requestAnimationFrame(drawStep);
        }

        if (timestamp - startTime > duration) {
          draw(1);
          resolve();
          return;
        }

        const progress = (timestamp - startTime) / duration;

        draw(progress);
        requestAnimationFrame(drawStep);
      };

      requestAnimationFrame(drawStep);
    });
  };

  const initializeEffects: InitializeEffectsFunc = (effectsCanvas, wheelCanvas) => {
    const animationManager = getAnimationManager();
    const canvasConfig = CanvasUtils.setupEffectsCanvas(effectsCanvas, wheelCanvas, 100);

    const effectsManager = new EffectsManager(
      effectsCanvas,
      {
        centerX: canvasConfig.centerX,
        centerY: canvasConfig.centerY,
        wheelRadius: canvasConfig.wheelRadius,
        canvasWidth: canvasConfig.width,
        canvasHeight: canvasConfig.height,
      },
      animationManager,
    );

    // Start the animation
    effectsManager.start();

    return effectsManager;
  };

  const updateEffects: UpdateEffectsFunc = (effectsManager, wheelCanvas) => {
    const radius = wheelCanvas.width / 2;
    const padding = 100;
    const effectsSize = wheelCanvas.width + padding * 2;

    effectsManager.updateConfig({
      centerX: effectsSize / 2,
      centerY: effectsSize / 2,
      wheelRadius: radius,
      canvasWidth: effectsSize,
      canvasHeight: effectsSize,
    });
  };

  const destroy = () => {
    if (pointerAnimationFrame) {
      console.log('destroy pointer animation');
      cancelAnimationFrame(pointerAnimationFrame);
    }
    pointerAnimationFrame = null;
  };

  return { drawWheel, highlightItem, eatAnimation, initializeEffects, updateEffects, destroy };
};
