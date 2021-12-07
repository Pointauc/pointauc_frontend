import * as PIXI from 'pixi.js';
import { IDestroyOptions } from 'pixi.js';
import PhysicObject from '../Phisics/PhysicObject';
import { Vector2 } from '../../../models/Arena/Glad';
import { getRandomIntInclusive } from '../../../utils/common.utils';

const spriteCounts = 5;

export default class BloodParticle extends PhysicObject {
  lifeTime: number;
  updater: (dt: number) => void;
  onDestroy?: (particle: BloodParticle, forceDestroy?: boolean) => boolean;

  constructor(container: PIXI.Container, position: Vector2) {
    const velocity: Vector2 = {
      x: (Math.random() < 0.5 ? 3 : -3) * (Math.random() * 3),
      y: (Math.random() < 0.5 ? 3 : -3) * (Math.random() * 3),
    };
    super(BloodParticle.getTexture(), position, velocity, Math.random() * 0.5 + 1);
    this.lifeTime = getRandomIntInclusive(800, 2000);
    // const scale = getRandomIntInclusive(1, 5);
    const scale = 4;
    this.scale.x = scale;
    this.scale.y = scale;
    const startY = position.y;

    this.updater = (dt: number): void => {
      this.lifeTime -= dt * 100;
      if (this.lifeTime <= 0) {
        this.onDeath();
        return;
      }

      if (this.position.y >= startY + 200) {
        this.onDeath(true);
        return;
      }

      this.updatePosition(dt);
    };

    PIXI.Ticker.shared.add(this.updater);

    container.addChild(this);
  }

  onDeath(forceDestroy?: boolean): void {
    PIXI.Ticker.shared.remove(this.updater);
    if (!this.onDestroy || this.onDestroy(this, forceDestroy)) {
      this.destroy();
    }
  }

  destroy(options?: IDestroyOptions | boolean): void {
    PIXI.Ticker.shared.remove(this.updater);
    super.destroy(options);
  }

  static getTexture(): PIXI.Texture {
    const { textures } = PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/particles/particles.json`];

    return textures![`blood_${getRandomIntInclusive(1, spriteCounts + 1)}.png`];
  }
}
