import * as PIXI from 'pixi.js';
import GladView from './GladView';
import BattleManagerView from './BattleManagerView';
import StageBackground from '../../assets/arena/StageBackground.png';
import { animationService } from './animations/animationService';
import globalParticleService from './Particles/globalParticleService';

export default class GameController {
  readonly app: PIXI.Application;
  stageBackground?: PIXI.Sprite;

  constructor(container: HTMLElement) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app = new PIXI.Application({ resizeTo: container });
    this.app.stage.sortableChildren = true;
    this.setBackground();

    animationService.app = this.app;

    globalParticleService.setup(this.app.stage);

    this.loadData();

    container.appendChild(this.app.view);

    // const testGlad = new Glad(createSlot());
    // testGlad[StatType.def] = 100;

    // new Array(300).fill(null).forEach((x, index) => {
    //   if (index === 100) {
    //     console.log('border ------------------------------------------');
    //   }
    //   console.log(Math.ceil(testGlad.reduceIncomingDamage(index + 1)));
    // });
  }

  loadData(): void {
    if (!Object.values(PIXI.Loader.shared.resources).length) {
      BattleManagerView.prepareLoad();
      animationService.prepareLoad();
      globalParticleService.prepareLoad();

      PIXI.Loader.shared.load();
    }
  }

  makeBattle = async (glads: GladView[]): Promise<GladView> => {
    const battleManagerView = new BattleManagerView(glads);

    battleManagerView.setup(this.app.stage, this.app.screen.width, this.app.screen.height);

    const winner = await battleManagerView.battle(PIXI.Ticker.shared);

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);
    });

    battleManagerView.destroy();
    globalParticleService.blood.clearBlood();

    return Promise.resolve(winner);
  };

  setBackground = (): void => {
    this.stageBackground = PIXI.Sprite.from(StageBackground);
    this.stageBackground.width = this.app.screen.width;
    this.stageBackground.height = this.app.screen.height;
    this.stageBackground.anchor.set(0, 0);
    this.stageBackground.x = 0;
    this.stageBackground.y = 0;

    this.app.stage.addChild(this.stageBackground);
  };

  setSpeed = (speed: number): void => {
    PIXI.Ticker.shared.speed = speed;
  };

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);

    if (this.stageBackground) {
      this.stageBackground.width = width;
      this.stageBackground.height = height;
    }
  }
}
