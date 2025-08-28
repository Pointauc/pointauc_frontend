export type AnimationCallback = (deltaTime: number, timestamp: number) => void;

export class AnimationManager {
  private animationId: number | null = null;
  private lastTimestamp: number = 0;
  private callbacks: Set<AnimationCallback> = new Set();
  private isRunning: boolean = false;
  private targetFPS: number = 60;
  private frameInterval: number;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  /**
   * Add animation callback
   */
  addCallback(callback: AnimationCallback): void {
    this.callbacks.add(callback);

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Remove animation callback
   */
  removeCallback(callback: AnimationCallback): void {
    this.callbacks.delete(callback);

    if (this.callbacks.size === 0) {
      this.stop();
    }
  }

  /**
   * Start animation loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.animate();
  }

  /**
   * Stop animation loop
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const currentTimestamp = performance.now();
    const deltaTime = currentTimestamp - this.lastTimestamp;

    // Frame rate limiting
    if (deltaTime >= this.frameInterval) {
      // Execute all callbacks
      this.callbacks.forEach((callback) => {
        try {
          callback(deltaTime, currentTimestamp);
        } catch (error) {
          console.error('Animation callback error:', error);
        }
      });

      this.lastTimestamp = currentTimestamp - (deltaTime % this.frameInterval);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.targetFPS;
  }

  /**
   * Set target FPS
   */
  setTargetFPS(fps: number): void {
    this.targetFPS = Math.max(1, Math.min(fps, 120)); // Clamp between 1-120 FPS
    this.frameInterval = 1000 / this.targetFPS;
  }

  /**
   * Check if animation is running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get number of active callbacks
   */
  get callbackCount(): number {
    return this.callbacks.size;
  }
}

/**
 * Easing functions for smooth animations
 */
export class Easing {
  static linear(t: number): number {
    return t;
  }

  static easeInSine(t: number): number {
    return 1 - Math.cos((t * Math.PI) / 2);
  }

  static easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
  }

  static easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

/**
 * Utility class for smooth value interpolation
 */
export class Interpolator {
  private currentValue: number;
  private targetValue: number;
  private speed: number;

  constructor(initialValue: number = 0, speed: number = 0.1) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.speed = speed;
  }

  /**
   * Set target value to interpolate towards
   */
  setTarget(value: number): void {
    this.targetValue = value;
  }

  /**
   * Update interpolation
   */
  update(deltaTime: number): number {
    const diff = this.targetValue - this.currentValue;
    const step = diff * this.speed * (deltaTime / 16.67); // Normalize to 60fps

    if (Math.abs(diff) < 0.001) {
      this.currentValue = this.targetValue;
    } else {
      this.currentValue += step;
    }

    return this.currentValue;
  }

  /**
   * Get current value
   */
  get value(): number {
    return this.currentValue;
  }

  /**
   * Set current value directly
   */
  setValue(value: number): void {
    this.currentValue = value;
    this.targetValue = value;
  }

  /**
   * Check if interpolation is complete
   */
  get isComplete(): boolean {
    return Math.abs(this.targetValue - this.currentValue) < 0.001;
  }
}
