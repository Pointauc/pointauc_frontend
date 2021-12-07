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
  Death2 = 'KnightDeath2',
}

class AnimationService {
  app?: PIXI.Application;

  get knightSheet(): PIXI.LoaderResource['textures'] | undefined {
    return PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/animations/knight/knight.json`].textures;
  }

  prepareLoad(): void {
    PIXI.Loader.shared.add(`${process.env.PUBLIC_URL}/arena/animations/knight/knight.json`);
  }

  getAnimation(name: string): PIXI.Texture<PIXI.Resource>[] {
    if (this.knightSheet) {
      const res = [];

      while (this.knightSheet[`${name}_${res.length + 1}.png`]) {
        res.push(this.knightSheet[`${name}_${res.length + 1}.png`]);
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
          PIXI.Ticker.shared.remove(onTick);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(onTick);
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
          PIXI.Ticker.shared.remove(onTick);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(onTick);
    });
  }

  async applyFilter(sprite: PIXI.Container, filter: PIXI.Filter, time: number): Promise<void> {
    await new Promise<void>((resolve) => {
      let passedTime = 0;
      const initialFilters = sprite.filters;
      sprite.filters = [filter];

      const onTick = (dt: number): void => {
        passedTime += dt * 100;

        if (passedTime >= time) {
          sprite.filters = initialFilters;
          PIXI.Ticker.shared.remove(onTick);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(onTick);
    });
  }

  async wait(time: number): Promise<void> {
    await new Promise<void>((resolve) => {
      let passedTime = 0;

      const onTick = (dt: number): void => {
        passedTime += dt * 100;

        if (passedTime >= time) {
          PIXI.Ticker.shared.remove(onTick);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(onTick);
    });
  }
}

export const animationService = new AnimationService();
