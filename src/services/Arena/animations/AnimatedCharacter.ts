import * as PIXI from 'pixi.js';
import { animationService, KnightAnimation } from './animationService';

export default class AnimatedCharacter extends PIXI.AnimatedSprite {
  name: string;
  idleState: KnightAnimation;

  get animationTextures(): PIXI.LoaderResource['textures'] | undefined {
    return PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/animations/${this.name}/${this.name}.json`]
      ?.textures;
  }

  getAnimation(key: KnightAnimation): PIXI.Texture<PIXI.Resource>[] {
    if (this.animationTextures) {
      const res = [];

      while (this.animationTextures[`${key}_${res.length + 1}.png`]) {
        res.push(this.animationTextures[`${key}_${res.length + 1}.png`]);
      }

      return res;
    }
    return [];
  }

  get defaultAnimation(): PIXI.Texture[] {
    return this.getAnimation(this.idleState);
  }

  idle(): void {
    this.textures = this.defaultAnimation;
    this.stop();
  }

  constructor(name: string, idleState = KnightAnimation.Idle, autoUpdate?: boolean) {
    super(animationService.getAnimation('KnightIdle'), autoUpdate);

    this.name = name;
    this.idleState = idleState;
    this.textures = this.defaultAnimation;
    this.stop();
  }

  async animate(animation: KnightAnimation, time: number, returnToIdle = true): Promise<void> {
    await new Promise((resolve) => {
      this.stop();
      this.loop = false;
      this.textures = this.getAnimation(animation);
      this.animationSpeed = (this.textures.length / time) * 16;
      this.play();

      this.onComplete = (): void => {
        if (returnToIdle) {
          this.idle();
        }
        this.onComplete = undefined;
        resolve(null);
      };
    });
  }
}
