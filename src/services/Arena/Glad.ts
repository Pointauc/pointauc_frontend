import { Key } from 'react';
import { Slot } from '../../models/slot.model';
import { StatType } from '../../models/Arena/Glad';
import { getRandomIntInclusive, getTotal, randomizeItem } from '../../utils/common.utils';

const initialStatDistribution: Record<StatType, number> = {
  [StatType.atk]: 1,
  [StatType.agi]: 1,
  [StatType.def]: 1,
};

export default class Glad {
  hp = 100;
  damage = 34;
  damageDelta = 0.2;
  readonly maxHp = 100;
  readonly id: Key;
  readonly slot: Slot;

  [StatType.atk] = 0;
  [StatType.agi] = 0;
  [StatType.def] = 0;

  get stat(): number {
    return getTotal(Object.values(StatType), (stat) => this[stat]);
  }

  constructor(slot: Slot) {
    this.id = slot.id;
    this.slot = slot;

    this.distributesStats(Number(slot.amount));
  }

  reset = (): void => {
    this.hp = this.maxHp;
  };

  applyDamage(damage: number): Promise<void> {
    return new Promise((resolve) => {
      // console.log(`${this.slot.name} recive ${damage} damage`);

      this.hp -= damage;
      resolve();
    });
  }

  interpolateDamage(): number {
    return getRandomIntInclusive(
      Math.round(this.damage - this.damage * this.damageDelta),
      Math.round(this.damage + this.damage * this.damageDelta),
    );
  }

  attack(glad: Glad): Promise<void> {
    return new Promise((resolve) => {
      // console.log(`${this.slot.name} attack ${glad.slot.name} with ${this.damage} damage`);
      const dealtDamage = this.interpolateDamage();
      resolve(glad.applyDamage(dealtDamage));
    });
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
}
