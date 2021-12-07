import * as PIXI from 'pixi.js';
import { IDestroyOptions } from 'pixi.js';
import PhysicObject from '../Phisics/PhysicObject';
import { Vector2 } from '../../../models/Arena/Glad';
import globalParticleService from './globalParticleService';

export default class HeadParticle extends PhysicObject {
  callback?: (dt: number) => void;
  onDestroy?: (particle: HeadParticle, forceDestroy?: boolean) => boolean;

  constructor(container: PIXI.Container, position: Vector2, direction: number) {
    const velocity: Vector2 = {
      x: direction * 5,
      y: -8,
    };
    super(HeadParticle.getTexture(), position, velocity, 0.5);
    const scale = 5;
    this.anchor.y = 1;
    this.anchor.x = 0.5;
    this.scale.x = scale;
    this.scale.y = scale;
    const startY = position.y;
    globalParticleService.blood.createFountain(this.position, 10);

    this.callback = (dt: number): void => {
      if (this.position.y >= startY + 150 && this.callback) {
        PIXI.Ticker.shared.remove(this.callback);
      }

      this.updatePosition(dt);
    };

    PIXI.Ticker.shared.add(this.callback);

    container.addChild(this);
  }

  destroy(options?: IDestroyOptions | boolean): void {
    if (this.callback) {
      PIXI.Ticker.shared.remove(this.callback);
    }
    super.destroy(options);
  }

  static getTexture(): PIXI.Texture {
    const { textures } = PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/particles/particles.json`];

    return textures![`head_1.png`];
  }
}
