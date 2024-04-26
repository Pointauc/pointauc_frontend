import { WheelItemWithAngle } from '@models/wheel.model.ts';
import { fitText } from '@utils/common.utils.ts';

type DrawWheelFunc = (
  items: WheelItemWithAngle[],
  wheelCanvas: HTMLCanvasElement,
  pointerCanvas: HTMLCanvasElement,
) => void;

interface Result {
  drawWheel: DrawWheelFunc;
}

const borderWidth = 3;
const maxTextLength = 21;
const selectorAngle = (Math.PI / 2) * 3;

export const useWheelDrawer = (): Result => {
  const drawText = (
    ctx: CanvasRenderingContext2D,
    center: number,
    { startAngle, endAngle, name }: WheelItemWithAngle,
  ): void => {
    if ((endAngle - startAngle) / Math.PI / 2 < 0.017) {
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
    { startAngle, endAngle, color }: Pick<WheelItemWithAngle, 'startAngle' | 'endAngle' | 'color'>,
    pieEdgeDefault?: { x: number; y: number },
  ): void => {
    ctx.fillStyle = color;
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

  const drawWheel: DrawWheelFunc = (items, wheelCanvas, pointerCanvas): void => {
    const ctx = wheelCanvas.getContext('2d');
    const pointerCtx = pointerCanvas.getContext('2d');
    const radius = Number(wheelCanvas.width) / 2;

    if (ctx) {
      items.forEach((item) => drawSlice(ctx, radius, item));
      items.forEach((item) => drawText(ctx, radius, item));
    }

    if (pointerCtx) {
      const preset = { startAngle: selectorAngle - 0.12, endAngle: selectorAngle + 0.12, color: '#353535' };
      drawSlice(pointerCtx, radius, preset, { x: radius, y: 45 });
    }
  };

  return { drawWheel };
};
