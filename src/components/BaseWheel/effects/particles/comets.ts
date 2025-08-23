export interface Comet {
  id: number;
  x: number;
  y: number;
  angle: number;
  orbitRadius: number; // Static radius from center
  speed: number;
  size: number;
  color: string;
  trailLength: number;
  opacity: number;
  pulsePhase: number;
}

// Configuration constants
const PULSE_DURATION = 3000; // 3 seconds per pulse cycle

export class CometSystem {
  private comets: Comet[] = [];
  private centerX: number;
  private centerY: number;
  private radius: number;

  constructor(centerX: number, centerY: number, radius: number) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.initializeComets();
  }

  private initializeComets(): void {
    const cometCount = 8;
    for (let i = 0; i < cometCount; i++) {
      this.comets.push(this.createComet(i));
    }
  }

  private createComet(id: number): Comet {
    const angle = (id * Math.PI * 2) / 8 + Math.random() * Math.PI * 2;
    const orbitRadius = this.radius + 30 + Math.random() * 30; // Static orbit radius

    return {
      id,
      x: this.centerX + Math.cos(angle) * orbitRadius,
      y: this.centerY + Math.sin(angle) * orbitRadius,
      angle,
      orbitRadius, // Store the static radius
      speed: 0.00006 + Math.random() * 0.0002, // Slow forward movement
      size: 2 + Math.random() * 3,
      color: `hsl(${180 + Math.random() * 60}, 70%, 80%)`, // Blue to cyan range
      trailLength: 100 + Math.random() * 120,
      opacity: 0.6 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  public update(deltaTime: number): void {
    this.comets.forEach((comet) => {
      // Move comet forward (clockwise)
      comet.angle += comet.speed * deltaTime;

      // Update position using static orbit radius (perfect circle)
      comet.x = this.centerX + Math.cos(comet.angle) * comet.orbitRadius;
      comet.y = this.centerY + Math.sin(comet.angle) * comet.orbitRadius;

      // Update pulse phase for glow animation
      comet.pulsePhase += (deltaTime / PULSE_DURATION) * Math.PI * 2;

      // Wrap angles
      if (comet.angle > Math.PI * 2) {
        comet.angle -= Math.PI * 2;
      }
      if (comet.pulsePhase > Math.PI * 2) {
        comet.pulsePhase -= Math.PI * 2;
      }
    });
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.comets.forEach((comet) => {
      ctx.save();

      // Calculate pulse intensity for glow effect
      const pulseIntensity = (Math.sin(comet.pulsePhase) + 1) / 2;
      const currentOpacity = comet.opacity * (0.6 + pulseIntensity * 0.4);

      // Use the comet's static orbit radius for trail calculation
      const trailArcRadius = comet.orbitRadius;

      // Draw curved arc trail perpendicular to wheel center
      const trailSegments = 8;
      const trailAngleSpan = (comet.trailLength / trailArcRadius) * 0.5; // Convert length to angle

      ctx.strokeStyle = `rgba(147, 197, 253, ${currentOpacity * 0.6})`;
      ctx.lineWidth = comet.size * 0.8;
      ctx.lineCap = 'round';

      for (let i = 0; i < trailSegments; i++) {
        const segmentProgress = i / trailSegments;
        const segmentAngle = comet.angle - trailAngleSpan * segmentProgress;
        const segmentX = this.centerX + Math.cos(segmentAngle) * trailArcRadius;
        const segmentY = this.centerY + Math.sin(segmentAngle) * trailArcRadius;

        const segmentOpacity = currentOpacity * (1 - segmentProgress * 0.8);
        ctx.globalAlpha = segmentOpacity;

        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(segmentX, segmentY);
        } else {
          ctx.lineTo(segmentX, segmentY);
        }
      }
      ctx.stroke();

      // Draw comet head with pulsing glow
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 10 + pulseIntensity * 8;
      ctx.shadowColor = comet.color;

      ctx.fillStyle = comet.color;
      ctx.globalAlpha = currentOpacity;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.size + pulseIntensity * 1, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.globalAlpha = currentOpacity * 0.8;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, (comet.size + pulseIntensity * 1) * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  public updateCenter(centerX: number, centerY: number, radius: number): void {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;

    // Update comet positions based on new center while maintaining their orbit radii
    this.comets.forEach((comet) => {
      comet.x = centerX + Math.cos(comet.angle) * comet.orbitRadius;
      comet.y = centerY + Math.sin(comet.angle) * comet.orbitRadius;
    });
  }
}
