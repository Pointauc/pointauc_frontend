import * as PIXI from 'pixi.js';
import GladView from './GladView';
import BattleManagerView from './BattleManagerView';
import StageBackground from '../../assets/arena/StageBackground.png';
import { animationService } from './animations/animationService';

export default class GameController {
  readonly app: PIXI.Application;

  constructor(container: HTMLElement, width: number, height: number) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app = new PIXI.Application({ width, height });
    this.setBackground();

    animationService.app = this.app;

    this.app.loader.add(`${process.env.PUBLIC_URL}/arena/animations/knight/knight.json`).load(() => {
      animationService.knightSheet =
        this.app.loader.resources[`${process.env.PUBLIC_URL}/arena/animations/knight/knight.json`];
    });

    container.appendChild(this.app.view);
  }

  makeBattle = async (glads: GladView[]): Promise<GladView> => {
    const battleManagerView = new BattleManagerView(glads);

    battleManagerView.setup(this.app.stage, this.app.screen.width, this.app.screen.height);

    const winner = await battleManagerView.battle();

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1100);
    });

    battleManagerView.stage?.destroy();

    return Promise.resolve(winner);
  };

  setBackground = (): void => {
    const stageBackground = PIXI.Sprite.from(StageBackground);
    stageBackground.width = this.app.screen.width;
    stageBackground.height = this.app.screen.height;
    stageBackground.anchor.set(0, 0);
    stageBackground.x = 0;
    stageBackground.y = 0;

    this.app.stage.addChild(stageBackground);
  };
}
