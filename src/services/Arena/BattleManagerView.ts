import * as PIXI from 'pixi.js';
import BattleManager from './BattleManager';
import GladView from './GladView';

const gladsPlacementRadius = 200;

export default class BattleManagerView extends BattleManager<GladView> {
  stage?: PIXI.Container;
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

  private setupBackground(): void {
    if (!BattleManagerView.backgroundTexture) {
      return;
    }

    const arenaBackground = PIXI.Sprite.from(BattleManagerView.backgroundTexture);
    arenaBackground.width = this.width;
    arenaBackground.height = this.height;
    arenaBackground.anchor.set(0, 0);
    arenaBackground.x = 0;
    arenaBackground.y = 0;

    this.stage!.addChild(arenaBackground);
  }

  setup(container: PIXI.Container, width: number, height: number): void {
    this.stage = new PIXI.Container();
    this.width = width;
    this.height = height;

    this.setupBackground();

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
}
