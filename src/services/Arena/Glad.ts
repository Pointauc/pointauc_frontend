import { Key } from 'react';
import { Slot } from '../../models/slot.model';
import { StatType, Team, TickerType, Vector2 } from '../../models/Arena/Glad';
import {
  fitText,
  getRandomIntInclusive,
  getRandomPointInCircle,
  getTotal,
  randomizeItem,
  wait,
} from '../../utils/common.utils';
import { GladState } from './GladState/GladState';
import { GladSeekingState } from './GladState/characterStates/GladSeekingState';
import { GladStateMap, gladStateMap } from './GladState/characterStates/GladStateMap';
import GladView from './GladView';

const initialStatDistribution: Record<StatType, number> = {
  [StatType.atk]: 1,
  [StatType.agi]: 1,
  [StatType.def]: 1,
};

export default class Glad {
  hp = 100;
  x = 0;
  y = 0;

  readyToAttack = false;

  private _stopUpdates?: () => void;

  team = Team.Red;
  state: GladState<Glad | GladView> = new GladSeekingState(this);

  damage = 34;
  damageDelta = 0.2;

  enemy?: Glad;
  target?: Vector2;

  readonly maxHp = 100;

  readonly id: Key;
  readonly name: string;
  readonly fullName: string;
  readonly slot: Slot;

  attackAnimationSpeed = 600;
  damageReceiveAnimationSpeed = 200;
  damageDelayTime = 450;

  rollTime = 400;
  moveSpeed = 400;
  attackRange = 120;
  recoverySpeed = 500;
  knockBackRange = 200;
  rollingRange = 250;

  ticker: TickerType;

  minBorder: Vector2 = { x: 50, y: 20 };
  maxBorder: Vector2 = { x: 800, y: 1100 };

  stateMap: GladStateMap<Glad | GladView> = gladStateMap;

  [StatType.atk] = 0;
  [StatType.agi] = 0;
  [StatType.def] = 0;

  setEnemy(glad: Glad): void {
    this.enemy = glad;

    this.state = this.stateMap.getSeekingState(this);
  }

  get stat(): number {
    return getTotal(Object.values(StatType), (stat) => this[stat]);
  }

  constructor(slot: Slot, ticker: TickerType) {
    this.id = slot.id;
    this.name = fitText(slot.name || '', 16);
    this.fullName = fitText(slot.name || '', 35);
    this.slot = slot;
    this.ticker = ticker;

    this.distributesStats(Number(slot.amount));
  }

  reset = (): void => {
    this.hp = this.maxHp;
  };

  applyDamage(damage: number, knockBack = 0): Promise<boolean> {
    return new Promise((resolve) => {
      // console.log(`${this.slot.name} recive ${damage} damage`);
      if (Math.random() > 0.25) {
        this.hp -= damage;
        this.state = this.stateMap.getDamageReceivingState(this, knockBack);
        resolve(true);
      } else {
        const { x: dx, y: dy } = getRandomPointInCircle(this.rollingRange, 0.4);
        this.state = this.stateMap.getRollinState(this, { x: this.x + dx, y: this.y + dy });
        resolve(false);
      }
    });
  }

  interpolateDamage(): number {
    return getRandomIntInclusive(
      Math.round(this.damage - this.damage * this.damageDelta),
      Math.round(this.damage + this.damage * this.damageDelta),
    );
  }

  async attack(glad: Glad): Promise<void> {
    const dealtDamage = this.interpolateDamage();
    this.state = this.stateMap.getAttackingState(this);
    // console.log(this.state);
    await wait(this.damageDelayTime, this.ticker);
    await glad.applyDamage(dealtDamage, this.knockBackRange * Math.random() * 0.6 + 0.8);
  }

  distributesStats = (stats: number, distribution: Record<StatType, number> = initialStatDistribution): void => {
    let restStats = stats;
    const distributionArray = Object.entries(distribution) as [StatType, number][];

    while (restStats) {
      const [stat] = randomizeItem(distributionArray, ([, value]) => value);

      this[stat] += 1;
      restStats -= 1;
    }
  };

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  startAI(): void {
    const update = (dt: number): void => {
      this.state.update(dt);
    };

    this.ticker.add(update);

    this._stopUpdates = () => this.ticker.remove(update);
  }

  stopUpdates(): void {
    this._stopUpdates && this._stopUpdates();
    this._stopUpdates = undefined;
  }
}
