import * as PIXI from 'pixi.js';
//
// interface AnimationController {
//   knightSheet?: PIXI.LoaderResource;
// }
export enum KnightAnimation {
  Attack = 'KnightAttack',
  Idle = 'KnightIdle',
  Shield = 'KnightShield',
  Death = 'KnightDeath',
}

class AnimationService {
  app?: PIXI.Application;
  knightSheet?: PIXI.LoaderResource;

  getAnimation(name: string): PIXI.Texture<PIXI.Resource>[] {
    if (this.knightSheet && this.knightSheet.textures) {
      const res = [];

      while (this.knightSheet.textures[`${name}-${res.length}.png`]) {
        res.push(this.knightSheet.textures[`${name}-${res.length}.png`]);
      }

      return res;
    }
    return [];
  }

  async animate(
    sprite: PIXI.AnimatedSprite,
    animation: KnightAnimation,
    defaultAnimation: KnightAnimation | null = KnightAnimation.Idle,
  ): Promise<void> {
    await new Promise((resolve) => {
      sprite.textures = this.getAnimation(animation);
      sprite.play();

      sprite.onComplete = (): void => {
        if (defaultAnimation) {
          sprite.textures = this.getAnimation(defaultAnimation);
        }
        resolve(null);
      };
    });
  }

  async animateMove(sprite: PIXI.Container, x: number, y: number, time: number): Promise<void> {
    await new Promise<void>((resolve) => {
      let passedTime = 0;
      const deltaX = x - sprite.x;

      const deltaY = y - sprite.y;
      const onTick = (dt: number): void => {
        // console.log(dt);
        passedTime += dt * 100;

        const modifier = Math.min(passedTime / time, 1);

        sprite.x = x + deltaX * modifier;
        sprite.y = y + deltaY * modifier;

        if (passedTime >= time) {
          this.app?.ticker.remove(onTick);
          resolve();
        }
      };

      this.app?.ticker.add(onTick);
    });
  }

  async animateFade(sprite: PIXI.Container, time: number): Promise<void> {
    await new Promise<void>((resolve) => {
      let passedTime = 0;
      const onTick = (dt: number): void => {
        // console.log(dt);
        passedTime += dt * 100;

        const modifier = Math.min(passedTime / time, 1);

        sprite.alpha = 1 - modifier;

        if (passedTime >= time) {
          this.app?.ticker.remove(onTick);
          resolve();
        }
      };

      this.app?.ticker.add(onTick);
    });
  }
}

export const animationService = new AnimationService();
