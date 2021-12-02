import Fighter from './Fighter';
import { Slot } from '../../models/slot.model';
import {
  getRandomInclusive,
  getRandomIntInclusive,
  getTotalSize,
  getTotalSize2,
  getTotalSize3,
} from '../../utils/common.utils';

class BattleManager {
  // eslint-disable-next-line no-useless-constructor
  constructor(readonly fighters: Fighter[]) {}

  reset = () => {
    this.fighters.forEach((fighter) => fighter.reset());
  };

  modifyFighters = (fighters: Fighter[], total: number): number[] =>
    fighters.map(({ value }) => (value ** 0.5 / total ** 0.5) * 100);

  getWinner = (fighters: Fighter[]): Fighter => {
    const total = getTotalSize2(fighters);
    const modded = this.modifyFighters(fighters, total);
    let restAmount = getRandomInclusive(getTotalSize3(modded));
    // console.log(restAmount);
    // console.log(total ** 0.5);
    // console.log(modded);

    const index = modded.findIndex((value) => {
      restAmount -= value;

      return restAmount <= 0;
    });

    // console.log(index);
    // if (!fighters[index]) {
    //   console.log(index);
    //   console.log(restAmount);
    // }

    return fighters[index] || fighters[fighters.length - 1];
  };

  fight = (first: Fighter, second: Fighter) => {
    const winner = this.getWinner([first, second]);
    const victim = winner === first ? second : first;

    winner.attack(victim);
  };

  battle = (): Fighter => {
    let winner: Fighter | null = null;

    while (!winner) {
      this.fight(this.fighters[0], this.fighters[1]);

      if (this.fighters[0].hp <= 0 || this.fighters[1].hp <= 0) {
        if (this.fighters[0].hp === this.fighters[1].hp) {
          winner = this.getWinner(this.fighters);
        }

        winner = this.fighters[0].hp > this.fighters[1].hp ? this.fighters[0] : this.fighters[1];
      }
    }

    // console.log(this.fighters);

    return winner;
  };
}

export default BattleManager;
