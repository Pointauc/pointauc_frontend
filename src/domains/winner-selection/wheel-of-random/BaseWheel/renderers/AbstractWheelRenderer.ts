import tinycolor from 'tinycolor2';

import { getSafeIndex2 } from '@utils/dataType/array';
import { Ease, interpolate } from '@utils/dataType/function.utils';

import wheelHelpers from '../helpers';

import { CanvasCache } from './CanvasCache';

import type { WheelItem, WheelItemWithAngle } from '@models/wheel.model';
import type { WheelRenderer, WheelRendererCanvasRefs, WheelRendererDrawOptions, WheelRendererLayout } from './types';

const BASE_WHEEL_SIZE = 800;
const CANVAS_OVERSCAN_MULTIPLIER = 1.3;

export abstract class AbstractWheelRenderer implements WheelRenderer {
  protected items: WheelItemWithAngle[] = [];
  protected layout: WheelRendererLayout = {
    targetWheelSize: 0,
    canvasSize: 0,
    center: 0,
    wheelRadius: 0,
    scale: 0,
    overflowPadding: 0,
  };
  protected rotation = 0;
  protected readonly canvasCache = new CanvasCache();
  protected itemsDirty = true;
  protected layoutDirty = true;

  constructor(protected readonly canvasRefs: WheelRendererCanvasRefs) {}

  get wheelContext(): CanvasRenderingContext2D {
    return this.canvasRefs.wheelCanvas.current!.getContext('2d')!;
  }

  get wheelCanvasDirty(): boolean {
    return this.itemsDirty || this.layoutDirty;
  }

  get foregroundCanvasDirty(): boolean {
    return this.layoutDirty;
  }

  setItems(items: WheelItem[]): void {
    this.items = wheelHelpers.defineAngle(items);
    this.itemsDirty = true;
  }

  getItems(): WheelItemWithAngle[] {
    return this.items;
  }

  setLayout(targetWheelSize: number): void {
    const safeWheelSize = Math.max(160, Math.round(targetWheelSize));
    const canvasSize = Math.round(safeWheelSize * CANVAS_OVERSCAN_MULTIPLIER);
    const overflowPadding = (canvasSize - safeWheelSize) / 2;

    this.layout = {
      targetWheelSize: safeWheelSize,
      canvasSize,
      center: canvasSize / 2,
      wheelRadius: safeWheelSize / 2,
      scale: safeWheelSize / BASE_WHEEL_SIZE,
      overflowPadding,
    };

    this.resizeCanvas(this.canvasRefs.wheelCanvas.current, canvasSize);
    this.resizeCanvas(this.canvasRefs.foregroundCanvas.current, canvasSize);
    this.canvasCache.resize(canvasSize);
    this.layoutDirty = true;
    this.onLayoutChange();
  }

  getLayout(): WheelRendererLayout | null {
    return this.layout;
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
    this.drawWheelFromCache();
    this.renderForegroundFrame();
  }

  getRotation(): number {
    return this.rotation;
  }

  draw(): void {
    if (this.wheelCanvasDirty) {
      this.drawItems(this.canvasCache.context, this.items, this.getBaseItemColor);
    }

    this.drawWheelFromCache();

    if (this.foregroundCanvasDirty) {
      this.renderForegroundFrame();
    }

    this.itemsDirty = false;
    this.layoutDirty = false;
  }

  highlightItem(id: WheelItem['id']): void {
    this.drawItems(
      this.wheelContext,
      this.items.map((item) => (item.id === id ? { ...item, color: item.color } : item)),
      (item) => (item.id === id ? item.color : tinycolor(item.color).greyscale().toHexString()),
    );
  }

  eatAnimation(id: WheelItem['id'], duration = 500): Promise<void> {
    if (!this.layout) {
      return Promise.resolve();
    }

    const removedItemIndex = this.items.findIndex((item) => item.id === id);
    if (removedItemIndex === -1 || this.items.length < 2) {
      return Promise.resolve();
    }

    const localRotation = ((this.rotation % 360) * Math.PI) / 180;
    let commonAngle = (3 * Math.PI) / 2 - localRotation;
    if (commonAngle < 0) {
      commonAngle += 2 * Math.PI;
    }

    const leftItem = this.items[getSafeIndex2(this.items, removedItemIndex - 1)];
    const rightItem = this.items[getSafeIndex2(this.items, removedItemIndex + 1)];

    return new Promise((resolve) => {
      let startTime: number | null = null;

      const drawStep = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;
          requestAnimationFrame(drawStep);
          return;
        }

        if (timestamp - startTime > duration) {
          this.drawCollapsedItems(leftItem, rightItem, commonAngle, 1);
          resolve();
          return;
        }

        const progress = (timestamp - startTime) / duration;
        this.drawCollapsedItems(leftItem, rightItem, commonAngle, progress);
        requestAnimationFrame(drawStep);
      };

      requestAnimationFrame(drawStep);
    });
  }

  setSpeedMultiplier(_multiplier: number): void {}

  hasEffects(): boolean {
    return false;
  }

  destroy(): void {}

  protected scale(value: number): number {
    return (this.layout?.scale ?? 1) * value;
  }

  protected clearCanvas(ctx: CanvasRenderingContext2D, canvasSize: number): void {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  protected beforeDraw(_ctx: CanvasRenderingContext2D, _items: WheelItemWithAngle[]): void {}

  protected afterDraw(_ctx: CanvasRenderingContext2D, _items: WheelItemWithAngle[]): void {}

  protected drawForeground(ctx: CanvasRenderingContext2D, frame: { deltaTime: number; timestamp: number }): void {
    this.drawPointer(ctx, frame);
  }

  protected onLayoutChange(): void {}

  protected getBaseItemColor(item: WheelItem): string {
    return item.color || '#000';
  }

  private resizeCanvas(canvas: HTMLCanvasElement | null, size: number): void {
    if (!canvas) {
      return;
    }

    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  private drawItems(
    ctx: CanvasRenderingContext2D,
    items: WheelItemWithAngle[],
    getColor: (item: WheelItem) => string,
  ): void {
    if (!this.layout) return;

    this.clearCanvas(ctx, this.layout.canvasSize);
    this.beforeDraw(ctx, items);
    items.forEach((item) => this.drawSlice(ctx, item, getColor));
    items.forEach((item) => this.drawText(ctx, item));
    this.afterDraw(ctx, items);
  }

  private drawWheelFromCache(): void {
    const { center, canvasSize } = this.layout;
    const ctx = this.wheelContext;
    const cachedCanvas = this.canvasCache.canvas;
    if (!cachedCanvas) {
      return;
    }

    this.clearCanvas(ctx, canvasSize);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.drawImage(cachedCanvas, -center, -center);
    ctx.restore();
  }

  private renderForegroundFrame = (timestamp = performance.now()) => {
    const { canvasSize } = this.layout;
    const foregroundCanvas = this.canvasRefs.foregroundCanvas.current;
    if (!foregroundCanvas) {
      return;
    }

    const ctx = foregroundCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    this.clearCanvas(ctx, canvasSize);
    this.drawForeground(ctx, { deltaTime: 16.67, timestamp });
  };

  private drawCollapsedItems(
    leftItem: WheelItemWithAngle,
    rightItem: WheelItemWithAngle,
    commonAngle: number,
    progress: number,
  ): void {
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

    this.drawItems(this.wheelContext, involvedItems, this.getBaseItemColor);
  }

  protected abstract drawText(ctx: CanvasRenderingContext2D, item: WheelItemWithAngle): void;

  protected abstract drawSlice(
    ctx: CanvasRenderingContext2D,
    item: WheelItemWithAngle,
    getColor: (item: WheelItem) => string,
  ): void;

  protected abstract drawPointer(ctx: CanvasRenderingContext2D, frame: { deltaTime: number; timestamp: number }): void;
}
