import tinycolor from 'tinycolor2';

import { fitText } from '@utils/common.utils';
import { WheelItem, WheelItemWithAngle } from '@models/wheel.model';

import CanvasSpinningWheel from './CanvasSpinningWheel';

import type { FC } from 'react';
import type { SpinningWheelProps } from '../types';

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;

const GenshinSpinningWheel: FC<SpinningWheelProps> = (props) => {
  return (
    <CanvasSpinningWheel
      {...props}
      renderer={{
        drawText(ctx, { startAngle, endAngle, name }: WheelItemWithAngle, { layout, scale }) {
          if ((endAngle - startAngle) / Math.PI / 2 < 0.016) {
            return;
          }

          const radius = layout.wheelRadius - scale(3);
          const text = fitText(name, maxTextLength);
          const currentTime = Date.now() * 0.003;

          ctx.save();
          ctx.font = `bold ${scale(22)}px Arial, sans-serif`;
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

          const outlineColors = [
            { color: 'rgba(0, 0, 0, 0.8)', width: 4 },
            { color: 'rgba(139, 92, 246, 0.6)', width: 3 },
            { color: 'rgba(59, 130, 246, 0.4)', width: 2 },
          ];

          outlineColors.forEach(({ color, width }) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            ctx.strokeText(text, 0, 0);
          });

          const textGradient = ctx.createLinearGradient(0, -11, 0, 11);
          textGradient.addColorStop(0, '#FFFFFF');
          textGradient.addColorStop(0.3, '#F0F9FF');
          textGradient.addColorStop(0.7, '#E0F2FE');
          textGradient.addColorStop(1, '#BAE6FD');

          ctx.fillStyle = textGradient;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
          ctx.fillText(text, 0, 0);

          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          const shimmerIntensity = (Math.sin(currentTime * 2) + 1) / 2;
          if (shimmerIntensity > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(shimmerIntensity - 0.7) * 0.4})`;
            ctx.fillText(text, 0, 0);
          }

          if (text.length > 14) {
            const sparkleCount = 3;
            const textWidth = ctx.measureText(text).width;

            for (let i = 0; i < sparkleCount; i++) {
              const sparkleX =
                -textWidth / 2 + (textWidth * i) / (sparkleCount - 1) + Math.sin(currentTime * 4 + i) * 5;
              const sparkleY = -15 + Math.cos(currentTime * 3 + i * 2) * 8;
              const sparkleSize = 1 + Math.sin(currentTime * 6 + i * 3) * 0.5;

              ctx.shadowBlur = 4;
              ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.beginPath();
              ctx.arc(sparkleX, sparkleY, sparkleSize, 0, 2 * Math.PI);
              ctx.fill();

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(sparkleX - sparkleSize * 2, sparkleY);
              ctx.lineTo(sparkleX + sparkleSize * 2, sparkleY);
              ctx.moveTo(sparkleX, sparkleY - sparkleSize * 2);
              ctx.lineTo(sparkleX, sparkleY + sparkleSize * 2);
              ctx.stroke();
            }

            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
          }

          ctx.restore();
        },
        drawSlice(ctx, item: WheelItemWithAngle, getColor: (item: WheelItem) => string, { layout, scale }) {
          const { startAngle, endAngle } = item;
          const baseColor = getColor(item);
          const radius = layout.wheelRadius - scale(innerBorderWidth);
          const currentTime = Date.now() * 0.002;

          ctx.save();

          const magicalGradient = ctx.createRadialGradient(
            layout.center,
            layout.center,
            radius * 0.3,
            layout.center,
            layout.center,
            radius,
          );
          const baseTinyColor = tinycolor(baseColor);
          magicalGradient.addColorStop(0, baseTinyColor.clone().lighten(15).toString());
          magicalGradient.addColorStop(0.4, baseColor);
          magicalGradient.addColorStop(0.8, baseTinyColor.clone().darken(10).toString());
          magicalGradient.addColorStop(1, baseTinyColor.clone().darken(20).toString());

          ctx.fillStyle = magicalGradient;
          ctx.beginPath();
          ctx.moveTo(layout.center, layout.center);
          ctx.arc(layout.center, layout.center, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fill();

          const angleSpan = endAngle - startAngle;
          if (angleSpan > 0.002) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = scale(1);

            const facetCount = Math.max(0, Math.floor(angleSpan * 3));
            for (let i = 1; i < facetCount; i++) {
              const facetAngle = startAngle + (angleSpan * i) / facetCount;
              const innerRadius = radius * 0.4;
              const outerRadius = radius * 0.9;

              ctx.beginPath();
              ctx.moveTo(
                layout.center + Math.cos(facetAngle) * innerRadius,
                layout.center + Math.sin(facetAngle) * outerRadius,
              );
              ctx.lineTo(
                layout.center + Math.cos(facetAngle) * outerRadius,
                layout.center + Math.sin(facetAngle) * outerRadius,
              );
              ctx.stroke();
            }

            for (let i = 1; i <= 2; i++) {
              const facetRadius = radius * (0.4 + i * 0.25);
              ctx.beginPath();
              ctx.arc(layout.center, layout.center, facetRadius, startAngle, endAngle);
              ctx.stroke();
            }
          }

          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 8;
          ctx.shadowColor = baseTinyColor.clone().brighten(30).setAlpha(0.6).toString();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = scale(2);
          ctx.beginPath();
          ctx.moveTo(layout.center, layout.center);
          ctx.lineTo(layout.center + Math.cos(startAngle) * radius, layout.center + Math.sin(startAngle) * radius);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(layout.center, layout.center);
          ctx.lineTo(layout.center + Math.cos(endAngle) * radius, layout.center + Math.sin(endAngle) * radius);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          if (angleSpan > 0.5) {
            const particleCount = Math.floor(angleSpan * 2);
            for (let i = 0; i < particleCount; i++) {
              const particleAngle = startAngle + (angleSpan * (i + 0.5)) / particleCount;
              const particleRadius = radius * (0.6 + Math.sin(currentTime * 3 + i) * 0.1);
              const particleX = layout.center + Math.cos(particleAngle) * particleRadius;
              const particleY = layout.center + Math.sin(particleAngle) * particleRadius;
              const particleSize = 1 + Math.sin(currentTime * 4 + i * 2) * 0.5;

              ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.beginPath();
              ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
              ctx.fill();
            }
          }

          ctx.restore();
        },
        afterDraw(ctx, _items, { layout, scale }) {
          const borderRadius = layout.wheelRadius - scale(borderWidth) / 2;
          const innerRadius = layout.wheelRadius - scale(borderWidth);

          ctx.save();

          const borderGradient = ctx.createLinearGradient(0, 0, layout.canvasSize, layout.canvasSize);
          borderGradient.addColorStop(0, '#F59E0B');
          borderGradient.addColorStop(0.25, '#3B82F6');
          borderGradient.addColorStop(0.5, '#8B5CF6');
          borderGradient.addColorStop(0.75, '#06B6D4');
          borderGradient.addColorStop(1, '#F59E0B');

          const borderLayers = [
            { radius: borderRadius, width: scale(2), alpha: 0.8 },
            { radius: borderRadius - scale(3), width: scale(4), alpha: 1 },
            { radius: borderRadius - scale(6), width: scale(2), alpha: 0.6 },
          ];

          borderLayers.forEach(({ radius, width, alpha }) => {
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = width;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = scale(8);
            ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
            ctx.beginPath();
            ctx.arc(layout.center, layout.center, radius, 0, 2 * Math.PI);
            ctx.stroke();
          });

          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
          ctx.globalAlpha = 1;

          const crystalCount = 24;
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
          ctx.lineWidth = scale(1);
          for (let i = 0; i < crystalCount; i++) {
            const angle = (i * 2 * Math.PI) / crystalCount;
            const innerCrystalRadius = innerRadius - scale(5);
            const outerCrystalRadius = innerRadius + scale(5);
            const crystalLength = i % 2 === 0 ? outerCrystalRadius : outerCrystalRadius - scale(3);

            ctx.beginPath();
            ctx.moveTo(
              layout.center + Math.cos(angle) * innerCrystalRadius,
              layout.center + Math.sin(angle) * innerCrystalRadius,
            );
            ctx.lineTo(
              layout.center + Math.cos(angle) * crystalLength,
              layout.center + Math.sin(angle) * crystalLength,
            );
            ctx.stroke();
          }

          const energyGradient = ctx.createRadialGradient(
            layout.center,
            layout.center,
            innerRadius - scale(20),
            layout.center,
            layout.center,
            layout.center,
          );
          energyGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
          energyGradient.addColorStop(0.7, 'rgba(147, 197, 253, 0.1)');
          energyGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');

          ctx.fillStyle = energyGradient;
          ctx.beginPath();
          ctx.arc(layout.center, layout.center, innerRadius, 0, 2 * Math.PI);
          ctx.arc(layout.center, layout.center, innerRadius - scale(20), 0, 2 * Math.PI, true);
          ctx.fill();

          ctx.restore();
        },
      }}
    />
  );
};

GenshinSpinningWheel.displayName = 'GenshinSpinningWheel';

export default GenshinSpinningWheel;
