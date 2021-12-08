import * as PIXI from 'pixi.js';
import Glad from './Glad';
import { GladChar, Vector2 } from '../../models/Arena/Glad';
import { animationService, KnightAnimation } from './animations/animationService';
import { getRandomInclusive } from '../../utils/common.utils';
import globalParticleService from './Particles/globalParticleService';
import globalConfig from './globalConfig';
import AnimatedCharacter from './animations/AnimatedCharacter';
import { Slot } from '../../models/slot.model';
import { GladSeekingStateView } from './GladState/characterStatesView/GladSeekingStateView';
import { gladViewStateMap } from './GladState/characterStatesView/GladViewStateMap';

const hpBarGraphics = {
  width: 100,
  height: 12,
  offset: 10,
  border: 1,
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

const shaderFrag = `
precision highp float;

varying vec2 vTextureCoord;

uniform vec2 mouse;
uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform float time;
uniform sampler2D uSampler;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  
  if (color.a != .0) {
    color.r = color.r + 0.4;
  }
  
  gl_FragColor = color;
}
`;

export default class GladView extends Glad {
  stage?: PIXI.Container;
  avatar?: AnimatedCharacter;
  hpBar?: PIXI.Graphics;
  activeArea?: PIXI.Graphics;
  char: GladChar = GladChar.Knight;
  _direction = 1;
  //
  // state: GladState<GladView> = new GladSeekingStateView(this);

  set direction(value: number) {
    if (value !== this._direction) {
      this._direction = value;

      if (this.avatar) {
        this.avatar.scale.x = 4 * this._direction;
      }
    }
  }

  constructor(slot: Slot) {
    super(slot, PIXI.Ticker.shared);

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.stateMap = gladViewStateMap;
    this.state = new GladSeekingStateView(this);
  }

  get avatarCenter(): Vector2 {
    return { x: this.x, y: this.y - this.avatar!.height / 2 };
  }

  async animateDamage(damage: number): Promise<void> {
    const startPosX = getRandomInclusive(this.x - damageProps.xZone, this.x + damageProps.xZone);
    const startPosY = getRandomInclusive(
      this.y - damageProps.yOffset,
      this.y - damageProps.yOffset - damageProps.yZone,
    );
    const text = new PIXI.Text((-damage).toString(), damageStyle);
    text.x = startPosX;
    text.y = startPosY;

    this.stage!.addChild(text);

    await Promise.all([
      animationService.animateMove(text, startPosX, startPosY - damageProps.yMove, 4000),
      animationService.animateFade(text, 4000),
    ]);

    text.destroy();
  }

  async animateDeath(): Promise<void> {
    if (globalConfig.isFinal || Math.random() >= 0.75) {
      const fountainPosition = this.avatarCenter;
      const positionsDelta: Vector2[] = [
        { x: 3, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: -1, y: 1 },
        { x: -1, y: 3 },
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 10 },
        { x: 0, y: 0 },
      ];
      globalParticleService.blood.createFountain(fountainPosition, 70);

      this.avatar!.onFrameChange = (frame: number): void => {
        if (positionsDelta[frame]) {
          fountainPosition.x += positionsDelta[frame].x * 5 * this._direction;
          fountainPosition.y += positionsDelta[frame].y * 5;
        }
      };
      globalParticleService.blood.pushHead(this.avatarCenter, -this._direction);
      await this.avatar?.animate(KnightAnimation.Death2, 700, false);
      this.avatar!.onFrameChange = undefined;
    } else {
      this.avatar?.animate(KnightAnimation.Death, 700, false);
    }
  }

  async applyDamage(damage: number, knockBack = 0): Promise<boolean> {
    const prevHp = this.hp;
    if (!(await super.applyDamage(damage, knockBack))) {
      return false;
    }

    animationService.wait(300);

    globalParticleService.blood.splat(this.avatarCenter);
    this.animateDamage(prevHp - this.hp);

    const filter = new PIXI.Filter(undefined, shaderFrag, {});
    animationService.applyFilter(this.avatar!, filter, 1000);

    this.renderHpBar();

    return true;
  }

  // async attack(glad: Glad): Promise<void> {
  //   this.avatar?.animate(KnightAnimation.Attack, this.attackSpeed, true);
  //   await super.attack(glad);
  // }

  setupAvatar = (flip: boolean): void => {
    this._direction = flip ? -1 : 1;
    this.avatar = new AnimatedCharacter('knight', KnightAnimation.Idle);
    this.avatar.animationSpeed = 0.28 * PIXI.Ticker.shared.speed;
    this.avatar.anchor.x = 0.5;
    this.avatar.anchor.y = 1;
    this.avatar.scale.x = 4 * this._direction;
    this.avatar.scale.y = 4;
    this.avatar.loop = false;
    this.avatar.play();

    this.stage?.addChild(this.avatar);
  };

  setupName(): void {
    const text = new PIXI.Text(this.fullName || '', nameStyle);
    text.x = -text.width / 2;
    text.y = -this.avatar!.height - nameGraphics.offset - text.height;

    this.stage?.addChild(text);
  }

  renderHpBar(): void {
    const xPos = -hpBarGraphics.width / 2;
    const yPos = hpBarGraphics.offset;
    const healthWidth = Math.max((hpBarGraphics.width * this.hp) / this.maxHp, 0);

    this.hpBar?.clear();

    this.hpBar?.beginFill(0x6cc16c);
    this.hpBar?.drawRect(xPos, yPos, healthWidth, hpBarGraphics.height);
    this.hpBar?.endFill();

    this.hpBar?.lineStyle(hpBarGraphics.border, 0xf0f0f0);
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

  renderAttackRange(): void {
    if (this.activeArea) {
      this.activeArea.beginFill(0xffe5b4, 0.2);
      this.activeArea.drawEllipse(0, 0, this.attackRange, this.attackRange / 2);
      this.activeArea.endFill();
    }
  }

  setupActiveArea(): void {
    this.activeArea = new PIXI.Graphics();
    this.activeArea.zIndex = -10;

    this.stage?.addChild(this.activeArea);
  }

  setup(container: PIXI.Container, x: number, y: number, flip: boolean): void {
    this.x = x;
    this.y = y;
    this.stage = new PIXI.Container();
    this.stage.x = x;
    this.stage.y = y;
    this.stage.sortableChildren = true;

    this.setupAvatar(flip);
    this.setupHpBar();
    this.setupName();
    // this.setupActiveArea();
    // this.renderAttackRange();

    container.addChild(this.stage);

    const updateDirection = (): void => {
      this.direction = this.x > (this.target?.x || 0) ? -1 : 1;

      if (this.avatar?.destroyed) {
        PIXI.Ticker.shared.remove(updateDirection);
      }
    };

    PIXI.Ticker.shared.add(updateDirection);

    // this.startAI();
  }

  move(dx: number, dy: number): void {
    super.move(dx, dy);

    this.stage!.x = this.x;
    this.stage!.y = this.y;
    this.stage!.zIndex = this.y;
  }
}
