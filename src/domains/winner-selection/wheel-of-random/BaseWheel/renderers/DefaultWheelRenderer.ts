import { fitText } from '@utils/common.utils';

import { AbstractWheelRenderer } from './AbstractWheelRenderer';

import type { WheelItem, WheelItemWithAngle } from '@models/wheel.model';

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;
const defaultPointerSizeMultiplier = 1.4;

export class DefaultWheelRenderer extends AbstractWheelRenderer {
  protected drawText(ctx: CanvasRenderingContext2D, { startAngle, endAngle, name }: WheelItemWithAngle) {
    if ((endAngle - startAngle) / Math.PI / 2 < 0.016) {
      return;
    }

    const { wheelRadius, center } = this.layout;
    const radius = wheelRadius - this.scale(3);
    const text = fitText(name, maxTextLength);

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = `${this.scale(22)}px Arial`;
    ctx.textBaseline = 'middle';

    const offsetModifier = -text.length * 0.007 + 1.3;
    const textRadius = (radius - ctx.measureText(text).width) / offsetModifier;
    const centerAngle = endAngle - (endAngle - startAngle) / 2;
    const textCoords = {
      x: textRadius * Math.cos(centerAngle),
      y: textRadius * Math.sin(centerAngle),
    };

    ctx.translate(textCoords.x + center, textCoords.y + center);
    ctx.rotate(centerAngle);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  protected drawSlice(
    ctx: CanvasRenderingContext2D,
    item: WheelItemWithAngle,
    getColor: (item: WheelItem) => string,
  ): void {
    const { startAngle, endAngle } = item;
    const { center, wheelRadius } = this.layout;
    const radius = wheelRadius - this.scale(innerBorderWidth);

    ctx.fillStyle = getColor(item);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = this.scale(innerBorderWidth);

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(center, center);
    ctx.stroke();
  }

  protected afterDraw(ctx: CanvasRenderingContext2D): void {
    const { center, wheelRadius } = this.layout;
    const scaledBorderWidth = this.scale(borderWidth);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = scaledBorderWidth;
    ctx.beginPath();
    ctx.arc(center, center, wheelRadius - scaledBorderWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();

    const innerShadowWidth = this.scale(15);
    const innerRadius = wheelRadius - scaledBorderWidth;
    const innerShadowGradient = ctx.createRadialGradient(
      center,
      center,
      innerRadius - innerShadowWidth,
      center,
      center,
      innerRadius,
    );
    innerShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerShadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
    innerShadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.save();
    ctx.fillStyle = innerShadowGradient;
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
    ctx.arc(center, center, innerRadius - innerShadowWidth, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.restore();
  }

  protected drawPointer(ctx: CanvasRenderingContext2D, _frame: { deltaTime: number; timestamp: number }): void {}
}
