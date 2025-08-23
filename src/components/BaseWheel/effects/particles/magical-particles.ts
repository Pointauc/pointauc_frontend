export interface MagicalParticle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  floatSpeed: number;
  size: number;
  color: string;
  opacity: number;
  pulsePhase: number;
  type: 'spark' | 'orb' | 'star';
}

// Configuration constants
const PULSE_DURATION = 2500; // 2.5 seconds per pulse cycle

export class MagicalParticleSystem {
  private particles: MagicalParticle[] = [];
  private centerX: number;
  private centerY: number;
  private radius: number;
  public speedMultiplier: number = 1;

  constructor(centerX: number, centerY: number, radius: number) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.initializeParticles();
  }

  private initializeParticles(): void {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle(i));
    }
  }

  private createParticle(id: number): MagicalParticle {
    const baseAngle = Math.random() * Math.PI * 2;
    const baseDistance = this.radius + 40 + Math.random() * 120;
    const baseX = this.centerX + Math.cos(baseAngle) * baseDistance;
    const baseY = this.centerY + Math.sin(baseAngle) * baseDistance;

    const types: ('spark' | 'orb' | 'star')[] = ['spark', 'orb', 'star'];
    const type = types[Math.floor(Math.random() * types.length)];

    return {
      id,
      x: baseX,
      y: baseY,
      baseX,
      baseY,
      angle: Math.random() * Math.PI * 2,
      orbitRadius: 10 + Math.random() * 25,
      orbitSpeed: 0.0001 + Math.random() * 0.0002,
      floatSpeed: 0.00005 + Math.random() * 0.00001,
      size: type === 'orb' ? 3 + Math.random() * 4 : 1 + Math.random() * 2,
      color: this.getParticleColor(type),
      opacity: 0.4 + Math.random() * 0.6,
      pulsePhase: Math.random() * Math.PI * 2,
      type,
    };
  }

  private getParticleColor(type: 'spark' | 'orb' | 'star'): string {
    switch (type) {
      case 'spark':
        return `hsl(${45 + Math.random() * 30}, 80%, 70%)`; // Golden sparks
      case 'orb':
        return `hsl(${200 + Math.random() * 60}, 70%, 80%)`; // Blue orbs
      case 'star':
        return `hsl(${280 + Math.random() * 40}, 60%, 85%)`; // Purple stars
      default:
        return '#FFFFFF';
    }
  }

  public update(deltaTime: number): void {
    this.particles.forEach((particle) => {
      // Update orbit angle
      particle.angle += particle.orbitSpeed * deltaTime * this.speedMultiplier;

      // Update base position (slow drift)
      const driftAngle = particle.id * 0.1 + Date.now() * particle.floatSpeed;
      const driftRadius = this.radius + 60 + Math.sin(driftAngle) * 80;
      particle.baseX = this.centerX + Math.cos(driftAngle) * driftRadius;
      particle.baseY = this.centerY + Math.sin(driftAngle) * driftRadius;

      // Calculate orbital position around base
      particle.x = particle.baseX + Math.cos(particle.angle) * particle.orbitRadius;
      particle.y = particle.baseY + Math.sin(particle.angle) * particle.orbitRadius;

      // Update pulse phase using configurable duration
      particle.pulsePhase += (deltaTime / PULSE_DURATION) * (0.75 + this.speedMultiplier / 4) * Math.PI * 2;

      // Wrap angles
      if (particle.angle > Math.PI * 2) {
        particle.angle -= Math.PI * 2;
      }
      if (particle.pulsePhase > Math.PI * 2) {
        particle.pulsePhase -= Math.PI * 2;
      }
    });
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach((particle) => {
      ctx.save();

      const pulseIntensity = (Math.sin(particle.pulsePhase) + 1) / 2;
      const currentSize = particle.size + pulseIntensity * (particle.size * 0.3);
      const currentOpacity = particle.opacity * (0.6 + pulseIntensity * 0.4);

      // Set glow effect
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 8 + pulseIntensity * 4;
      ctx.shadowColor = particle.color;

      ctx.globalAlpha = currentOpacity;

      switch (particle.type) {
        case 'spark':
          this.drawSpark(ctx, particle.x, particle.y, currentSize, particle.color, pulseIntensity);
          break;
        case 'orb':
          this.drawOrb(ctx, particle.x, particle.y, currentSize, particle.color);
          break;
        case 'star':
          this.drawStar(ctx, particle.x, particle.y, currentSize, particle.color, particle.angle);
          break;
      }

      ctx.restore();
    });
  }

  private drawSpark(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    intensity: number,
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Spark lines
    const lineLength = size * 3 + intensity * 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - lineLength, y);
    ctx.lineTo(x + lineLength, y);
    ctx.moveTo(x, y - lineLength);
    ctx.lineTo(x, y + lineLength);
    ctx.stroke();
  }

  private drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    // Create gradient for orb
    const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, color.replace('80%', '40%'));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    rotation: number,
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle = color;
    ctx.beginPath();

    // Draw 5-pointed star
    const points = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const pointX = Math.cos(angle) * radius;
      const pointY = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  public updateCenter(centerX: number, centerY: number, radius: number): void {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  }
}
