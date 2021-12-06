import * as PIXI from 'pixi.js';
import PhysicObject from '../Phisics/PhysicObject';
import { Vector2 } from '../../../models/Arena/Glad';
import { getRandomIntInclusive } from '../../../utils/common.utils';

const spriteCounts = 5;

export default class BloodParticle extends PhysicObject {
  lifeTime: number;
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

    const update = (dt: number): void => {
      this.lifeTime -= dt * 100;
      const destroy = (forceDestroy?: boolean): void => {
        PIXI.Ticker.shared.remove(update);
        if (!this.onDestroy || this.onDestroy(this, forceDestroy)) {
          this.destroy();
        }
      };

      if (this.lifeTime <= 0) {
        destroy();
        return;
      }

      if (this.position.y >= startY + 200) {
        destroy(true);
        return;
      }

      this.updatePosition(dt);
    };

    PIXI.Ticker.shared.add(update);

    container.addChild(this);
  }

  static getTexture(): PIXI.Texture {
    const { textures } = PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/particles/particles.json`];

    return textures![`blood_${getRandomIntInclusive(1, spriteCounts + 1)}.png`];
  }
}
