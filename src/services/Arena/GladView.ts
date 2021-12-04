import * as PIXI from 'pixi.js';
import Glad from './Glad';
import { GladChar } from '../../models/Arena/Glad';
import { animationService, KnightAnimation } from './animations/animationService';
import { getRandomInclusive } from '../../utils/common.utils';

const hpBarGraphics = {
  width: 200,
  height: 30,
  offset: 80,
};

const avatarGraphics = {
  radius: 34,
  border: 4,
};

const nameGraphics = {
  offset: -40,
};

const damageProps = {
  yOffset: 20,
  yZone: 40,
  xZone: 80,
  yMove: 30,
};

const nameStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 19,
  fill: '#fff',
});

const damageStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 18,
  fontWeight: '600',
  fill: '#d93a3a',
});

export default class GladView extends Glad {
  stage?: PIXI.Container;
  avatar?: PIXI.AnimatedSprite;
  hpBar?: PIXI.Graphics;
  char: GladChar = GladChar.Knight;
  x = 0;
  y = 0;

  async animateDamage(damage: number): Promise<void> {
    const startPosX = getRandomInclusive(this.x - damageProps.xZone, this.x + damageProps.xZone);
    const startPosY = getRandomInclusive(
      this.y - damageProps.yOffset,
      this.y - damageProps.yOffset - damageProps.yZone,
    );
    const text = new PIXI.Text((-damage).toString(), damageStyle);
    text.x = startPosX;
    text.y = startPosY;

    console.log(startPosX);
    console.log(startPosY);

    this.stage!.addChild(text);

    await Promise.all([
      animationService.animateMove(text, startPosX, startPosY - damageProps.yMove, 4000),
      animationService.animateFade(text, 4000),
    ]);

    text.destroy();
  }

  async animateDeath(): Promise<void> {
    await animationService.animate(this.avatar!, KnightAnimation.Death, null);
  }

  async applyDamage(damage: number): Promise<void> {
    await animationService.animate(this.avatar!, KnightAnimation.Shield);

    await super.applyDamage(damage);
    this.animateDamage(damage);
    this.renderHpBar();

    if (this.hp <= 0) {
      await this.animateDeath();
    }
  }

  async attack(glad: Glad): Promise<void> {
    await Promise.all([
      new Promise((resolve) => {
        this.avatar!.onFrameChange = (): void => {
          if (this.avatar!.currentFrame === 3) {
            resolve(super.attack(glad));
            this.avatar!.onFrameChange = undefined;
          }
        };
      }),
      animationService.animate(this.avatar!, KnightAnimation.Attack),
    ]);
  }

  setupAvatar = (flip: boolean): void => {
    this.avatar = new PIXI.AnimatedSprite(animationService.getAnimation('KnightIdle'));
    this.avatar.animationSpeed = 0.25;
    this.avatar.x = this.x;
    this.avatar.y = this.y;
    this.avatar.scale.x = flip ? -5 : 5;
    this.avatar.scale.y = 5;
    this.avatar.loop = false;
    this.avatar.play();

    this.stage?.addChild(this.avatar);
  };

  setupName(): void {
    const text = new PIXI.Text(this.slot.name || '', nameStyle);
    text.x = this.x - text.width / 2;
    text.y = this.y - this.avatar!.height / 2 - nameGraphics.offset - text.height;

    this.stage?.addChild(text);
  }

  renderHpBar(): void {
    const xPos = this.x - hpBarGraphics.width / 2;
    const yPos = this.y + avatarGraphics.radius + hpBarGraphics.offset;
    const healthWidth = Math.max((hpBarGraphics.width * this.hp) / this.maxHp, 0);

    this.hpBar?.clear();

    this.hpBar?.beginFill(0x6cc16c);
    this.hpBar?.drawRect(xPos, yPos, healthWidth, hpBarGraphics.height);
    this.hpBar?.endFill();

    this.hpBar?.lineStyle(avatarGraphics.border, 0xf0f0f0);
    this.hpBar?.drawRect(xPos, yPos, hpBarGraphics.width, hpBarGraphics.height);
    this.hpBar?.endFill();
  }

  setupHpBar(): void {
    if (this.hpBar) {
      this.hpBar.destroy();
    }

    this.hpBar = new PIXI.Graphics();

    this.renderHpBar();

    this.stage?.addChild(this.hpBar);
  }

  setup(container: PIXI.Container, x: number, y: number, flip: boolean): void {
    this.x = x;
    this.y = y;
    this.stage = new PIXI.Container();

    this.setupAvatar(flip);
    this.setupHpBar();
    this.setupName();

    container.addChild(this.stage);
  }
}
