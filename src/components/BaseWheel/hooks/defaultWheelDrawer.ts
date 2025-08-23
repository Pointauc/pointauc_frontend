import tinycolor from 'tinycolor2';
import { Key } from 'react';

import { WheelItem, WheelItemWithAngle } from '@models/wheel.model.ts';
import { fitText } from '@utils/common.utils.ts';
import { getSafeIndex2 } from '@utils/dataType/array.ts';
import { Ease, interpolate } from '@utils/dataType/function.utils.ts';

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

interface Result {
  drawWheel: DrawWheelFunc;
  highlightItem: HighlightItemFunc;
  eatAnimation: EatAnimationFunc;
}

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;
const selectorAngle = (Math.PI / 2) * 3;
// Pointer size multiplier - adjust this to make the pointer bigger/smaller (default 1.4 = 40% larger)
const defaultPointerSizeMultiplier = 1.4;

const colorGetter = (item: WheelItem) => item.color || '#000';

export const defaultWheelDrawer = (): Result => {
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

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
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
    ctx.fillText(text, 0, 0);
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
    ctx.fillStyle = getColor(item);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = innerBorderWidth;

    const pieEdge = pieEdgeDefault || { x: center, y: center };
    const radius = center - ctx.lineWidth;

    ctx.beginPath();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.stroke();
  };

  const drawPointer = (
    ctx: CanvasRenderingContext2D,
    center: number,
    sizeMultiplier = defaultPointerSizeMultiplier,
  ): void => {
    const baseWidth = 28;
    const baseHeight = 46;
    const pointerWidth = baseWidth * sizeMultiplier;
    const pointerHeight = baseHeight * sizeMultiplier;
    const pointerX = center;
    const pointerY = borderWidth + 10;

    // Clear the pointer canvas
    ctx.clearRect(0, 0, center * 2, center * 2);

    // Save context for transformations
    ctx.save();

    // Create gradient for the pointer - elegant silver/steel
    const gradient = ctx.createLinearGradient(
      pointerX - pointerWidth / 2,
      pointerY,
      pointerX + pointerWidth / 2,
      pointerY + pointerHeight,
    );
    gradient.addColorStop(0, '#E8E8E8'); // Light silver
    gradient.addColorStop(0.3, '#C0C0C0'); // Silver
    gradient.addColorStop(0.7, '#808080'); // Medium gray
    gradient.addColorStop(1, '#4A4A4A'); // Dark steel

    // Configure shadow properties for enhanced depth effect
    ctx.shadowOffsetX = 4 * sizeMultiplier;
    ctx.shadowOffsetY = 6 * sizeMultiplier;
    ctx.shadowBlur = 10 * sizeMultiplier;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';

    // Draw main pointer body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY + pointerHeight); // Point at bottom
    ctx.lineTo(pointerX - pointerWidth / 2, pointerY + 15 * sizeMultiplier); // Left side
    ctx.quadraticCurveTo(
      pointerX - pointerWidth / 2 - 5 * sizeMultiplier,
      pointerY + 5 * sizeMultiplier,
      pointerX - pointerWidth / 3,
      pointerY,
    ); // Left top curve
    ctx.quadraticCurveTo(pointerX, pointerY - 5 * sizeMultiplier, pointerX + pointerWidth / 3, pointerY); // Top curve
    ctx.quadraticCurveTo(
      pointerX + pointerWidth / 2 + 5 * sizeMultiplier,
      pointerY + 5 * sizeMultiplier,
      pointerX + pointerWidth / 2,
      pointerY + 15 * sizeMultiplier,
    ); // Right top curve
    ctx.closePath();
    ctx.fill();

    // Reset shadow properties before drawing border and other elements
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Add border/outline
    ctx.strokeStyle = '#3F3F3F'; // Dark charcoal border
    ctx.lineWidth = 2 * sizeMultiplier;
    ctx.stroke();

    // Add highlight shine
    const shineGradient = ctx.createLinearGradient(
      pointerX - pointerWidth / 4,
      pointerY + 5 * sizeMultiplier,
      pointerX + pointerWidth / 4,
      pointerY + 20 * sizeMultiplier,
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.moveTo(pointerX - pointerWidth / 4, pointerY + 8 * sizeMultiplier);
    ctx.lineTo(pointerX + pointerWidth / 4, pointerY + 8 * sizeMultiplier);
    ctx.lineTo(pointerX + pointerWidth / 6, pointerY + 25 * sizeMultiplier);
    ctx.lineTo(pointerX - pointerWidth / 6, pointerY + 25 * sizeMultiplier);
    ctx.closePath();
    ctx.fill();

    // Add small decorative gem at the top
    ctx.fillStyle = '#1E3A8A'; // Deep navy blue
    ctx.beginPath();
    ctx.ellipse(pointerX, pointerY + 3 * sizeMultiplier, 4 * sizeMultiplier, 6 * sizeMultiplier, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Gem highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(
      pointerX - 1 * sizeMultiplier,
      pointerY + 2 * sizeMultiplier,
      1.5 * sizeMultiplier,
      2 * sizeMultiplier,
      0,
      0,
      2 * Math.PI,
    );
    ctx.fill();

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

      // Draw outer border (thick circle around the wheel)
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.arc(radius, radius, radius - borderWidth / 2, 0, 2 * Math.PI);
      ctx.stroke();

      // Add inner shadow to the wheel for depth
      const innerShadowWidth = 15;
      const innerRadius = radius - borderWidth;

      // Create radial gradient for inner shadow
      const innerShadowGradient = ctx.createRadialGradient(
        radius,
        radius,
        innerRadius - innerShadowWidth,
        radius,
        radius,
        innerRadius,
      );
      innerShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent at inner edge
      innerShadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)'); // Light shadow
      innerShadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)'); // Darker shadow at border

      // Draw the inner shadow ring
      ctx.save();
      ctx.fillStyle = innerShadowGradient;
      ctx.beginPath();
      ctx.arc(radius, radius, innerRadius, 0, 2 * Math.PI);
      ctx.arc(radius, radius, innerRadius - innerShadowWidth, 0, 2 * Math.PI, true); // Inner hole
      ctx.fill();
      ctx.restore();
    }

    // Draw the pointer on the pointer canvas
    if (pointerCtx) {
      drawPointer(pointerCtx, radius);
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

  return { drawWheel, highlightItem, eatAnimation };
};
