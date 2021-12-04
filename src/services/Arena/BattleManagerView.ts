import * as PIXI from 'pixi.js';
import BattleManager from './BattleManager';
import GladView from './GladView';
import ArenaBackground from '../../assets/arena/ArenaBackground.png';

const gladsPlacementRadius = 200;

export default class BattleManagerView extends BattleManager<GladView> {
  stage?: PIXI.Container;
  width = 0;
  height = 0;

  private setupBackground(): void {
    const arenaBackground = PIXI.Sprite.from(ArenaBackground);
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
      }, 500);
    });

    await super.fight(first, second);
  }
}
