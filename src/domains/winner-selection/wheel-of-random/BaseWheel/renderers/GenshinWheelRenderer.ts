import tinycolor from 'tinycolor2';

import { fitText } from '@utils/common.utils';

import { EffectsManager } from '../effects';

import { AbstractWheelRenderer } from './AbstractWheelRenderer';

import type { WheelItem, WheelItemWithAngle } from '@models/wheel.model';
import type { WheelRendererLayout } from './types';

const borderWidth = 5;
const innerBorderWidth = 2;
const maxTextLength = 21;
const defaultPointerSizeMultiplier = 1.4;

export class GenshinWheelRenderer extends AbstractWheelRenderer {
  private effectsManager: EffectsManager | null = null;
  private foregroundAnimationFrame: number | null = null;
  private lastForegroundTimestamp: number | null = null;

  hasEffects(): boolean {
    return true;
  }

  draw(): void {
    super.draw();
    this.restartForegroundAnimation();
  }

  setSpeedMultiplier(multiplier: number): void {
    this.effectsManager?.setSpeedMultiplier(multiplier);
  }

  destroy(): void {
    this.stopForegroundAnimation();
    super.destroy();
    this.effectsManager?.destroy();
    this.effectsManager = null;
  }

  protected drawText(ctx: CanvasRenderingContext2D, { startAngle, endAngle, name }: WheelItemWithAngle) {
    if ((endAngle - startAngle) / Math.PI / 2 < 0.016) {
      return;
    }

    const { wheelRadius, center } = this.layout;
    const radius = wheelRadius - this.scale(3);
    const text = fitText(name, maxTextLength);
    const currentTime = Date.now() * 0.003;

    ctx.save();
    ctx.font = `bold ${this.scale(22)}px Arial, sans-serif`;
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
        const sparkleX = -textWidth / 2 + (textWidth * i) / (sparkleCount - 1) + Math.sin(currentTime * 4 + i) * 5;
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
  }

  protected drawSlice(
    ctx: CanvasRenderingContext2D,
    item: WheelItemWithAngle,
    getColor: (item: WheelItem) => string,
  ): void {
    const { startAngle, endAngle } = item;
    const baseColor = getColor(item);
    const { center, wheelRadius } = this.layout;
    const radius = wheelRadius - this.scale(innerBorderWidth);
    const currentTime = Date.now() * 0.002;

    ctx.save();

    const magicalGradient = ctx.createRadialGradient(center, center, radius * 0.3, center, center, radius);
    const baseTinyColor = tinycolor(baseColor);
    magicalGradient.addColorStop(0, baseTinyColor.clone().lighten(15).toString());
    magicalGradient.addColorStop(0.4, baseColor);
    magicalGradient.addColorStop(0.8, baseTinyColor.clone().darken(10).toString());
    magicalGradient.addColorStop(1, baseTinyColor.clone().darken(20).toString());

    ctx.fillStyle = magicalGradient;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    const angleSpan = endAngle - startAngle;
    if (angleSpan > 0.002) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = this.scale(1);

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

      for (let i = 1; i <= 2; i++) {
        const facetRadius = radius * (0.4 + i * 0.25);
        ctx.beginPath();
        ctx.arc(center, center, facetRadius, startAngle, endAngle);
        ctx.stroke();
      }
    }

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = baseTinyColor.clone().brighten(30).setAlpha(0.6).toString();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = this.scale(2);
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(startAngle) * radius, center + Math.sin(startAngle) * radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(endAngle) * radius, center + Math.sin(endAngle) * radius);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

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
  }

  protected afterDraw(ctx: CanvasRenderingContext2D): void {
    const { center, wheelRadius, canvasSize } = this.layout;
    const borderRadius = wheelRadius - this.scale(borderWidth) / 2;
    const innerRadius = wheelRadius - this.scale(borderWidth);

    ctx.save();

    const borderGradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    borderGradient.addColorStop(0, '#F59E0B');
    borderGradient.addColorStop(0.25, '#3B82F6');
    borderGradient.addColorStop(0.5, '#8B5CF6');
    borderGradient.addColorStop(0.75, '#06B6D4');
    borderGradient.addColorStop(1, '#F59E0B');

    const borderLayers = [
      { radius: borderRadius, width: this.scale(2), alpha: 0.8 },
      { radius: borderRadius - this.scale(3), width: this.scale(4), alpha: 1 },
      { radius: borderRadius - this.scale(6), width: this.scale(2), alpha: 0.6 },
    ];

    borderLayers.forEach(({ radius, width, alpha }) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = width;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = this.scale(8);
      ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;

    const crystalCount = 24;
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
    ctx.lineWidth = this.scale(1);
    for (let i = 0; i < crystalCount; i++) {
      const angle = (i * 2 * Math.PI) / crystalCount;
      const innerCrystalRadius = innerRadius - this.scale(5);
      const outerCrystalRadius = innerRadius + this.scale(5);
      const crystalLength = i % 2 === 0 ? outerCrystalRadius : outerCrystalRadius - this.scale(3);

      ctx.beginPath();
      ctx.moveTo(center + Math.cos(angle) * innerCrystalRadius, center + Math.sin(angle) * innerCrystalRadius);
      ctx.lineTo(center + Math.cos(angle) * crystalLength, center + Math.sin(angle) * crystalLength);
      ctx.stroke();
    }

    const energyGradient = ctx.createRadialGradient(
      center,
      center,
      innerRadius - this.scale(20),
      center,
      center,
      center,
    );
    energyGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
    energyGradient.addColorStop(0.7, 'rgba(147, 197, 253, 0.1)');
    energyGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');

    ctx.fillStyle = energyGradient;
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
    ctx.arc(center, center, innerRadius - this.scale(20), 0, 2 * Math.PI, true);
    ctx.fill();

    ctx.restore();
  }

  protected onLayoutChange(): void {
    const { center, wheelRadius, canvasSize } = this.layout;
    const foregroundCanvas = this.canvasRefs.foregroundCanvas.current;
    if (!foregroundCanvas) {
      return;
    }

    if (!this.effectsManager) {
      this.effectsManager = new EffectsManager(foregroundCanvas, {
        centerX: center,
        centerY: center,
        wheelRadius: wheelRadius,
        canvasWidth: canvasSize,
        canvasHeight: canvasSize,
      });
      return;
    }

    this.effectsManager.updateConfig({
      centerX: center,
      centerY: center,
      wheelRadius: wheelRadius,
      canvasWidth: canvasSize,
      canvasHeight: canvasSize,
    });
  }

  protected drawForeground(ctx: CanvasRenderingContext2D, frame: { deltaTime: number; timestamp: number }): void {
    this.effectsManager?.renderFrame(frame.deltaTime, frame.timestamp);
    this.drawPointer(ctx, frame);
  }

  private restartForegroundAnimation(): void {
    this.stopForegroundAnimation();

    const foregroundCanvas = this.canvasRefs.foregroundCanvas.current;
    if (!foregroundCanvas) {
      return;
    }

    const animate = (timestamp: number) => {
      const ctx = foregroundCanvas.getContext('2d');
      if (!ctx) {
        this.stopForegroundAnimation();
        return;
      }

      const deltaTime = this.lastForegroundTimestamp == null ? 16.67 : timestamp - this.lastForegroundTimestamp;
      this.lastForegroundTimestamp = timestamp;

      ctx.clearRect(0, 0, this.layout.canvasSize, this.layout.canvasSize);
      this.drawForeground(ctx, { deltaTime, timestamp });

      this.foregroundAnimationFrame = requestAnimationFrame(animate);
    };

    this.foregroundAnimationFrame = requestAnimationFrame(animate);
  }

  private stopForegroundAnimation(): void {
    if (this.foregroundAnimationFrame) {
      cancelAnimationFrame(this.foregroundAnimationFrame);
      this.foregroundAnimationFrame = null;
    }

    this.lastForegroundTimestamp = null;
  }

  protected drawPointer(ctx: CanvasRenderingContext2D, frame: { deltaTime: number; timestamp: number }): void {
    const { center, overflowPadding, scale } = this.layout;
    const baseWidth = 32;
    const baseHeight = 55;
    const sizeMultiplier = defaultPointerSizeMultiplier * scale;
    const pointerWidth = baseWidth * sizeMultiplier;
    const pointerHeight = baseHeight * sizeMultiplier;
    const pointerX = center;
    const pointerY = overflowPadding + this.scale(borderWidth + 12);
    const currentTime = frame.timestamp * 0.001;

    ctx.save();

    const mainGradient = ctx.createLinearGradient(
      pointerX - pointerWidth / 2,
      pointerY,
      pointerX + pointerWidth / 2,
      pointerY + pointerHeight,
    );
    mainGradient.addColorStop(0, '#E0F2FE');
    mainGradient.addColorStop(0.2, '#38BDF8');
    mainGradient.addColorStop(0.5, '#3B82F6');
    mainGradient.addColorStop(0.8, '#6366F1');
    mainGradient.addColorStop(1, '#8B5CF6');

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 20 * sizeMultiplier;
    ctx.shadowColor = '#60A5FA';

    ctx.fillStyle = mainGradient;
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
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

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

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 0.8 * sizeMultiplier;
    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY + pointerHeight * 0.1);
    ctx.lineTo(pointerX, pointerY + pointerHeight * 0.85);
    ctx.moveTo(pointerX - pointerWidth / 5, pointerY + pointerHeight * 0.5);
    ctx.lineTo(pointerX, pointerY + pointerHeight * 0.1);
    ctx.moveTo(pointerX + pointerWidth / 5, pointerY + pointerHeight * 0.5);
    ctx.lineTo(pointerX, pointerY + pointerHeight * 0.1);
    ctx.stroke();

    const gemSize = 6 * sizeMultiplier;
    const gemGradient = ctx.createRadialGradient(
      pointerX - gemSize * 0.3,
      pointerY - gemSize * 0.3,
      0,
      pointerX,
      pointerY,
      gemSize,
    );
    gemGradient.addColorStop(0, '#FEF3C7');
    gemGradient.addColorStop(0.3, '#F59E0B');
    gemGradient.addColorStop(0.7, '#D97706');
    gemGradient.addColorStop(1, '#92400E');

    ctx.fillStyle = gemGradient;
    ctx.beginPath();
    ctx.arc(pointerX, pointerY - 3 * sizeMultiplier, gemSize, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(pointerX - gemSize * 0.3, pointerY - 3 * sizeMultiplier - gemSize * 0.3, gemSize * 0.4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = sizeMultiplier;
    ctx.beginPath();
    ctx.arc(pointerX, pointerY - 3 * sizeMultiplier, gemSize, 0, 2 * Math.PI);
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + currentTime * 0.5;
      const distance = 25 * sizeMultiplier + Math.sin(currentTime * 2 + i) * 8 * sizeMultiplier;
      const particleX = pointerX + Math.cos(angle) * distance;
      const particleY = pointerY + pointerHeight * 0.3 + Math.sin(angle) * distance * 0.5;
      const particleSize = (2 + Math.sin(currentTime * 3 + i * 2)) * sizeMultiplier;

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 8 * sizeMultiplier;
      ctx.shadowColor = '#60A5FA';
      ctx.fillStyle = '#BFDBFE';
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#DBEAFE';
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize * 0.6, 0, 2 * Math.PI);
      ctx.fill();
    }

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
  }
}
