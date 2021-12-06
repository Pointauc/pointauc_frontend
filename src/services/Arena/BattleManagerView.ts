import * as PIXI from 'pixi.js';
import BattleManager from './BattleManager';
import GladView from './GladView';

const gladsPlacementRadius = 200;

export default class BattleManagerView extends BattleManager<GladView> {
  stage?: PIXI.Container;
  arenaBackground?: PIXI.Sprite;
  width = 0;
  height = 0;
  _fightDelay = 500;

  static get backgroundTexture(): PIXI.Texture | undefined {
    return PIXI.Loader.shared.resources[`${process.env.PUBLIC_URL}/arena/ArenaBackground.png`].texture;
  }

  get fightDelay(): number {
    // eslint-disable-next-line no-underscore-dangle
    return this._fightDelay / PIXI.Ticker.shared.speed;
  }

  static prepareLoad(): void {
    PIXI.Loader.shared.add(`${process.env.PUBLIC_URL}/arena/ArenaBackground.png`);
  }

  private setupBackground(container: PIXI.Container): void {
    if (!BattleManagerView.backgroundTexture) {
      return;
    }

    this.arenaBackground = PIXI.Sprite.from(BattleManagerView.backgroundTexture);
    this.arenaBackground.width = this.width;
    this.arenaBackground.height = this.height;
    this.arenaBackground.anchor.set(0, 0);
    this.arenaBackground.x = 0;
    this.arenaBackground.y = 0;

    container.addChild(this.arenaBackground);
  }

  setup(container: PIXI.Container, width: number, height: number): void {
    this.stage = new PIXI.Container();
    this.width = width;
    this.height = height;
    this.stage.zIndex = 10;

    this.setupBackground(container);

    const xOffset = width / 2 - gladsPlacementRadius;

    this.glads.forEach((glad, index) =>
      glad.setup(this.stage!, xOffset + index * gladsPlacementRadius * 2, height / 2, !!index),
    );

    container.addChild(this.stage);
  }

  async fight(first: GladView, second: GladView): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, this.fightDelay);
    });

    await super.fight(first, second);
  }

  destroy(): void {
    this.stage?.destroy();
    this.arenaBackground?.destroy();
  }
}
