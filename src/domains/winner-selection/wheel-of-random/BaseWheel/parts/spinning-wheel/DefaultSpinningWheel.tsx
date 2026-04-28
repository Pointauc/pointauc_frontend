import { fitText } from '@utils/common.utils';
import { WheelItem, WheelItemWithAngle } from '@models/wheel.model';

import CanvasSpinningWheel from './CanvasSpinningWheel';

import type { FC } from 'react';
import type { SpinningWheelProps } from '../types';

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;

const DefaultSpinningWheel: FC<SpinningWheelProps> = (props) => {
  return (
    <CanvasSpinningWheel
      {...props}
      renderer={{
        drawText(ctx, { startAngle, endAngle, name, displayName }: WheelItemWithAngle, { layout, scale }) {
          if ((endAngle - startAngle) / Math.PI / 2 < 0.016) {
            return;
          }

          const radius = layout.wheelRadius - scale(3);
          const text = fitText(displayName || name, maxTextLength);

          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = `${scale(22)}px Arial`;
          ctx.textBaseline = 'middle';

          const offsetModifier = -text.length * 0.007 + 1.3;
          const textRadius = (radius - ctx.measureText(text).width) / offsetModifier;
          const centerAngle = endAngle - (endAngle - startAngle) / 2;
          const textCoords = {
            x: textRadius * Math.cos(centerAngle),
            y: textRadius * Math.sin(centerAngle),
          };

          ctx.translate(textCoords.x + layout.center, textCoords.y + layout.center);
          ctx.rotate(centerAngle);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        },
        drawSlice(ctx, item: WheelItemWithAngle, getColor: (item: WheelItem) => string, { layout, scale }) {
          const { startAngle, endAngle } = item;
          const radius = layout.wheelRadius - scale(innerBorderWidth);

          ctx.fillStyle = getColor(item);
          ctx.strokeStyle = '#eee';
          ctx.lineWidth = scale(innerBorderWidth);

          ctx.beginPath();
          ctx.moveTo(layout.center, layout.center);
          ctx.arc(layout.center, layout.center, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fill();
          ctx.moveTo(layout.center, layout.center);
          ctx.stroke();
        },
        afterDraw(ctx, _items, { layout, scale }) {
          const scaledBorderWidth = scale(borderWidth);
          ctx.strokeStyle = '#eee';
          ctx.lineWidth = scaledBorderWidth;
          ctx.beginPath();
          ctx.arc(layout.center, layout.center, layout.wheelRadius - scaledBorderWidth / 2, 0, 2 * Math.PI);
          ctx.stroke();

          const innerShadowWidth = scale(15);
          const innerRadius = layout.wheelRadius - scaledBorderWidth;
          const innerShadowGradient = ctx.createRadialGradient(
            layout.center,
            layout.center,
            innerRadius - innerShadowWidth,
            layout.center,
            layout.center,
            innerRadius,
          );
          innerShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          innerShadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
          innerShadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

          ctx.save();
          ctx.fillStyle = innerShadowGradient;
          ctx.beginPath();
          ctx.arc(layout.center, layout.center, innerRadius, 0, 2 * Math.PI);
          ctx.arc(layout.center, layout.center, innerRadius - innerShadowWidth, 0, 2 * Math.PI, true);
          ctx.fill();
          ctx.restore();
        },
      }}
    />
  );
};

DefaultSpinningWheel.displayName = 'DefaultSpinningWheel';

export default DefaultSpinningWheel;
