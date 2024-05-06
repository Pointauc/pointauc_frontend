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

const borderWidth = 3;
const maxTextLength = 21;
const selectorAngle = (Math.PI / 2) * 3;

const colorGetter = (item: WheelItem) => item.color || '#000';

export const useWheelDrawer = (): Result => {
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
    ctx.lineWidth = borderWidth;

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

  const drawWheel: DrawWheelFunc = ({ items, wheelCanvas, pointerCanvas, getColor = colorGetter, clear = true }) => {
    const ctx = wheelCanvas.getContext('2d');
    const pointerCtx = pointerCanvas.getContext('2d');
    const radius = Number(wheelCanvas.width) / 2;

    if (ctx) {
      clear && ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
      items.forEach((item) => drawSlice(ctx, radius, item, undefined, getColor));
      items.forEach((item) => drawText(ctx, radius, item));
    }

    if (pointerCtx) {
      const preset: WheelItemWithAngle = {
        startAngle: selectorAngle - 0.12,
        endAngle: selectorAngle + 0.12,
        color: '#353535',
        id: 'pointer',
        name: 'pointer',
        amount: 0,
      };
      drawSlice(pointerCtx, radius, preset, { x: radius, y: 45 });
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
