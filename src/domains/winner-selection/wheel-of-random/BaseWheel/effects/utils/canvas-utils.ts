export interface CanvasConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  wheelRadius: number;
}

export class CanvasUtils {
  /**
   * Setup effects canvas with proper size and positioning
   */
  static setupEffectsCanvas(
    canvas: HTMLCanvasElement,
    wheelCanvas: HTMLCanvasElement,
    padding: number = 100,
  ): CanvasConfig {
    const wheelSize = wheelCanvas.width;
    const effectsSize = wheelSize + padding * 2;

    // Set canvas dimensions
    canvas.width = effectsSize;
    canvas.height = effectsSize;

    // Position canvas to be centered over wheel canvas
    canvas.style.position = 'absolute';
    canvas.style.left = `-${padding}px`;
    canvas.style.top = `-${padding}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2';

    const centerX = effectsSize / 2;
    const centerY = effectsSize / 2;
    const wheelRadius = wheelSize / 2;

    return {
      width: effectsSize,
      height: effectsSize,
      centerX,
      centerY,
      wheelRadius,
    };
  }

  /**
   * Clear canvas with optional background
   */
  static clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, backgroundColor?: string): void {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  /**
   * Setup canvas context with common settings
   */
  static setupContext(ctx: CanvasRenderingContext2D): void {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Draw a circular mask to hide effects outside the specified radius
   */
  static applyCircularMask(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number = 0,
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';

    ctx.beginPath();
    if (innerRadius > 0) {
      // Create donut shape mask
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
    } else {
      // Simple circular mask
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    }

    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }

  /**
   * Get optimal effects canvas size based on wheel size
   */
  static getOptimalEffectsSize(wheelSize: number): { size: number; padding: number } {
    const padding = Math.max(100, wheelSize * 0.3);
    const size = wheelSize + padding * 2;

    return { size, padding };
  }

  /**
   * Convert wheel coordinates to effects canvas coordinates
   */
  static wheelToEffectsCoords(wheelX: number, wheelY: number, padding: number): { x: number; y: number } {
    return {
      x: wheelX + padding,
      y: wheelY + padding,
    };
  }

  /**
   * Check if point is within canvas bounds
   */
  static isInBounds(x: number, y: number, width: number, height: number): boolean {
    return x >= 0 && x <= width && y >= 0 && y <= height;
  }

  /**
   * Calculate distance between two points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Normalize angle to 0-2π range
   */
  static normalizeAngle(angle: number): number {
    while (angle < 0) angle += Math.PI * 2;
    while (angle > Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  }
}
