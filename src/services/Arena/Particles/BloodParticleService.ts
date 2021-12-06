import * as PIXI from 'pixi.js';
import { Vector2 } from '../../../models/Arena/Glad';
import BloodParticle from './BloodParticle';
import { getRandomIntInclusive } from '../../../utils/common.utils';

export default class BloodParticleService {
  activeStage: PIXI.Container;
  passiveStage: PIXI.Container;
  particles: BloodParticle[] = [];

  constructor() {
    this.activeStage = new PIXI.ParticleContainer(1500, { position: true });
    this.passiveStage = new PIXI.ParticleContainer(300);

    this.activeStage.zIndex = 20;
    this.passiveStage.zIndex = 1;
  }

  clearBlood(): void {
    this.passiveStage.removeChildren();
  }

  splat(position: Vector2): void {
    for (let i = 0; i < 35; i++) {
      const bloodCell = new BloodParticle(this.activeStage, position);
      this.activeStage.addChild(bloodCell);
      bloodCell.onDestroy = (cell, forceDestroy): boolean => {
        const shouldDestroy = forceDestroy || getRandomIntInclusive(0, 6) < 1;

        if (shouldDestroy) {
          return true;
        }

        this.activeStage.removeChild(cell);
        this.passiveStage.addChild(cell);
        return false;
      };
      // this.particles.push(bloodCell);
    }
  }

  setup(container: PIXI.Container): void {
    container.addChild(this.activeStage);
    container.addChild(this.passiveStage);
  }
}
