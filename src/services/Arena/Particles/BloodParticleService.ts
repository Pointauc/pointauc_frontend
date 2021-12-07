import * as PIXI from 'pixi.js';
import { Vector2 } from '../../../models/Arena/Glad';
import BloodParticle from './BloodParticle';
import { getRandomIntInclusive } from '../../../utils/common.utils';
import BloodFountain from './BloodFountain';
import HeadParticle from './HeadParticle';

export default class BloodParticleService {
  screenEffectsStage: PIXI.Graphics;
  activeStage: PIXI.Container;
  passiveStage: PIXI.Container;
  particles: BloodParticle[] = [];
  fountains: BloodFountain[] = [];

  constructor() {
    this.activeStage = new PIXI.ParticleContainer(1500, { position: true });
    this.passiveStage = new PIXI.ParticleContainer(300);
    this.screenEffectsStage = new PIXI.Graphics();

    this.screenEffectsStage.zIndex = 30;
    this.activeStage.zIndex = 20;
    this.passiveStage.zIndex = 1;
  }

  clearBlood(): void {
    this.fountains.forEach((fountain) => {
      fountain.destroy();
    });
    this.activeStage.children.forEach((bloodCell) => {
      bloodCell.destroy();
    });
    this.passiveStage.removeChildren();
    this.activeStage.removeChildren();
    this.screenEffectsStage.clear();

    this.fountains = [];
  }

  createFountain(position: Vector2, bloodsPerSecond: number): void {
    this.fountains.push(new BloodFountain(position, bloodsPerSecond));
  }

  splat(position: Vector2, particles = 35): void {
    for (let i = 0; i < particles; i++) {
      const bloodCell = new BloodParticle(this.activeStage, position);
      this.activeStage.addChild(bloodCell);
      bloodCell.onDestroy = (cell, forceDestroy): boolean => {
        const shouldDestroy = forceDestroy || getRandomIntInclusive(0, 6) < 1;

        if (shouldDestroy) {
          // if (getRandomIntInclusive(0, 2) > 0) {
          //   const offset = 200;
          //   const radius = getRandomIntInclusive(1, 15);
          //   const x = getRandomIntInclusive(bloodCell.position.x - offset, bloodCell.position.x + offset);
          //   const y = getRandomIntInclusive(bloodCell.position.y - offset, bloodCell.position.y + offset);
          //
          //   this.screenEffectsStage.beginFill(0xff3c3c);
          //   this.screenEffectsStage.drawCircle(x, y, radius);
          //   this.screenEffectsStage.endFill();
          // }
          return true;
        }

        this.activeStage.removeChild(cell);
        this.passiveStage.addChild(cell);
        return false;
      };
    }
  }

  pushHead(position: Vector2, direction: number): void {
    // eslint-disable-next-line no-new
    new HeadParticle(this.activeStage, { ...position }, direction);
  }

  setup(container: PIXI.Container): void {
    container.addChild(this.activeStage);
    container.addChild(this.passiveStage);
    container.addChild(this.screenEffectsStage);
  }
}
