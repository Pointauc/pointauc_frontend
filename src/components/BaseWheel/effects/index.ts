import { CometSystem } from './particles/comets';
import { RuneSystem } from './particles/runes';
import { MagicalParticleSystem } from './particles/magical-particles';
import { CanvasUtils, CanvasConfig } from './utils/canvas-utils';
import { AnimationManager, AnimationCallback } from './utils/animation-utils';

export interface EffectsManagerConfig {
  centerX: number;
  centerY: number;
  wheelRadius: number;
  canvasWidth: number;
  canvasHeight: number;
}

export class EffectsManager {
  private cometSystem: CometSystem;
  private runeSystem: RuneSystem;
  private magicalParticleSystem: MagicalParticleSystem;
  private config: EffectsManagerConfig;
  private ctx: CanvasRenderingContext2D;
  private animationManager: AnimationManager;
  private animationCallback: AnimationCallback;

  constructor(canvas: HTMLCanvasElement, config: EffectsManagerConfig, animationManager: AnimationManager) {
    this.config = config;
    this.animationManager = animationManager;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from effects canvas');
    }
    this.ctx = context;

    // Setup canvas context
    CanvasUtils.setupContext(this.ctx);

    // Initialize particle systems
    this.cometSystem = new CometSystem(config.centerX, config.centerY, config.wheelRadius);
    this.runeSystem = new RuneSystem(config.centerX, config.centerY, config.wheelRadius);
    this.magicalParticleSystem = new MagicalParticleSystem(config.centerX, config.centerY, config.wheelRadius);

    // Create animation callback
    this.animationCallback = this.animate.bind(this);
  }

  /**
   * Start the effects animation
   */
  start(): void {
    this.animationManager.addCallback(this.animationCallback);
  }

  /**
   * Stop the effects animation
   */
  stop(): void {
    this.animationManager.removeCallback(this.animationCallback);
  }

  /**
   * Update effects configuration (when canvas resizes)
   */
  updateConfig(config: EffectsManagerConfig): void {
    this.config = config;

    // Update all particle systems
    this.cometSystem.updateCenter(config.centerX, config.centerY, config.wheelRadius);
    this.runeSystem.updateCenter(config.centerX, config.centerY, config.wheelRadius);
    this.magicalParticleSystem.updateCenter(config.centerX, config.centerY, config.wheelRadius);
  }

  /**
   * Main animation loop
   */
  private animate(deltaTime: number, timestamp: number): void {
    // Clear canvas
    CanvasUtils.clearCanvas(this.ctx, this.config.canvasWidth, this.config.canvasHeight);

    // Draw static background aura ring
    this.drawBackgroundAura();

    // Update all particle systems
    this.cometSystem.update(deltaTime);
    this.runeSystem.update(deltaTime);
    this.magicalParticleSystem.update(deltaTime);

    // Draw all particle systems
    this.cometSystem.draw(this.ctx);
    this.runeSystem.draw(this.ctx);
    this.magicalParticleSystem.draw(this.ctx);

    // Optional: Apply circular mask to hide effects outside wheel area
    // Uncomment if you want to limit effects to a specific area
    // CanvasUtils.applyCircularMask(
    //   this.ctx,
    //   this.config.centerX,
    //   this.config.centerY,
    //   this.config.wheelRadius + 150
    // );
  }

  /**
   * Draw background aura effect
   */
  drawBackgroundAura(): void {
    const { centerX, centerY, wheelRadius } = this.config;

    // Calculate border radius (matching the main wheel border)
    const borderWidth = 5;
    const borderRadius = wheelRadius - borderWidth / 2;

    // Outer magical aura ring (matching the original design)
    const auraGradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      borderRadius + 15,
      centerX,
      centerY,
      borderRadius + 25,
    );
    auraGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    auraGradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.2)');
    auraGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    this.ctx.fillStyle = auraGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, borderRadius + 25, 0, 2 * Math.PI);
    this.ctx.arc(centerX, centerY, borderRadius + 15, 0, 2 * Math.PI, true);
    this.ctx.fill();
  }

  /**
   * Get the number of active particles
   */
  getParticleCount(): { comets: number; runes: number; magical: number } {
    return {
      comets: 8, // CometSystem has 8 comets
      runes: 12, // RuneSystem has 12 runes
      magical: 20, // MagicalParticleSystem has 20 particles
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
  }
}

// Export all particle systems and utilities
export { CometSystem } from './particles/comets';
export { RuneSystem } from './particles/runes';
export { MagicalParticleSystem } from './particles/magical-particles';
export { CanvasUtils } from './utils/canvas-utils';
export { AnimationManager, Easing, Interpolator } from './utils/animation-utils';
export type { CanvasConfig } from './utils/canvas-utils';
export type { AnimationCallback } from './utils/animation-utils';
