export interface RuneParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  symbol: string;
  size: number;
  color: string;
  glowIntensity: number;
  pulsePhase: number;
  opacity: number;
}

// Configuration constants
const PULSE_DURATION = 4000; // 4 seconds per pulse cycle

export class RuneSystem {
  private runes: RuneParticle[] = [];
  private centerX: number;
  private centerY: number;
  private radius: number;
  private runeSymbols: string[] = [
    'ᚠ',
    'ᚢ',
    'ᚦ',
    'ᚨ',
    'ᚱ',
    'ᚲ',
    'ᚷ',
    'ᚹ',
    'ᚺ',
    'ᚾ',
    'ᛁ',
    'ᛃ',
    'ᛇ',
    'ᛈ',
    'ᛉ',
    'ᛊ',
    'ᛋ',
    'ᛏ',
    'ᛒ',
    'ᛖ',
    'ᛗ',
    'ᛚ',
    'ᛜ',
    'ᛞ',
    'ᛟ',
  ];

  constructor(centerX: number, centerY: number, radius: number) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.initializeRunes();
  }

  private initializeRunes(): void {
    const runeCount = 12;
    for (let i = 0; i < runeCount; i++) {
      this.runes.push(this.createRune(i));
    }
  }

  private createRune(id: number): RuneParticle {
    const angle = (id * Math.PI * 2) / 12 + Math.random() * Math.PI * 0.2;
    const orbitRadius = this.radius + 30 + Math.random() * 40;

    return {
      id,
      x: this.centerX + Math.cos(angle) * orbitRadius,
      y: this.centerY + Math.sin(angle) * orbitRadius,
      angle,
      speed: -0.001 * 0.01, // Slow backward movement (negative)
      symbol: this.runeSymbols[Math.floor(Math.random() * this.runeSymbols.length)],
      size: 16 + Math.random() * 8,
      color: '#F59E0B', // Amber color
      glowIntensity: 0.6 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      opacity: 0.7 + Math.random() * 0.3,
    };
  }

  public update(deltaTime: number): void {
    this.runes.forEach((rune) => {
      // Move rune backward (counter-clockwise)
      rune.angle += rune.speed * deltaTime;

      // Update position with slight orbital variation
      const orbitVariation = Math.sin(Date.now() * 0.001 + rune.id) * 15;
      const orbitRadius = this.radius + 30 + orbitVariation;
      rune.x = this.centerX + Math.cos(rune.angle) * orbitRadius;
      rune.y = this.centerY + Math.sin(rune.angle) * orbitRadius;

      // Update pulse phase for animation using configurable duration
      rune.pulsePhase += (deltaTime / PULSE_DURATION) * Math.PI * 2;

      // Wrap angles
      if (rune.angle < 0) {
        rune.angle += Math.PI * 2;
      }
      if (rune.pulsePhase > Math.PI * 2) {
        rune.pulsePhase -= Math.PI * 2;
      }
    });
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.runes.forEach((rune) => {
      ctx.save();

      // Move to rune position and rotate
      ctx.translate(rune.x, rune.y);
      ctx.rotate(rune.angle + Math.PI / 2);

      // Calculate pulsing effect
      const pulseIntensity = (Math.sin(rune.pulsePhase) + 1) / 2;
      const currentSize = rune.size + pulseIntensity * 4;
      const currentOpacity = rune.opacity * (0.6 + pulseIntensity * 0.4);

      // Draw outer glow
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 12 + pulseIntensity * 6;
      ctx.shadowColor = `rgba(251, 191, 36, ${rune.glowIntensity})`;

      // Set font and text properties
      ctx.font = `bold ${currentSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
      ctx.globalAlpha = currentOpacity;

      // Draw the rune symbol
      ctx.fillText(rune.symbol, 0, 0);

      // Draw inner bright highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.3})`;
      ctx.font = `bold ${currentSize * 0.8}px Arial, sans-serif`;
      ctx.fillText(rune.symbol, 0, 0);

      ctx.restore();
    });
  }

  public updateCenter(centerX: number, centerY: number, radius: number): void {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;

    // Update all rune positions based on new center and radius
    this.runes.forEach((rune) => {
      const orbitRadius = radius + 30;
      rune.x = centerX + Math.cos(rune.angle) * orbitRadius;
      rune.y = centerY + Math.sin(rune.angle) * orbitRadius;
    });
  }
}
