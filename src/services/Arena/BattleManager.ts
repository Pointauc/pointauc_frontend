import Glad from './Glad';
import { getRandomInclusive, getTotal } from '../../utils/common.utils';

class BattleManager<GladType extends Glad> {
  // eslint-disable-next-line no-useless-constructor
  constructor(readonly glads: GladType[]) {}

  reset = (): void => {
    this.glads.forEach((glad) => glad.reset());
  };

  getWinner(glads: GladType[]): GladType {
    const updatedData = glads.map(({ stat }) => stat ** (1 / 2));
    const total = getTotal(updatedData, (stat) => stat);
    let restAmount = getRandomInclusive(0, total);
    // console.log(restAmount);
    // console.log(total ** 0.5);
    // console.log(modded);

    const index = updatedData.findIndex((stat) => {
      restAmount -= stat;

      return restAmount <= 0;
    });

    // console.log(index);
    // if (!Glads[index]) {
    //   console.log(index);
    //   console.log(restAmount);
    // }

    return glads[index] || glads[glads.length - 1];
  }

  async fight(first: GladType, second: GladType): Promise<void> {
    const winner = this.getWinner([first, second]);
    const victim = winner === first ? second : first;

    await winner.attack(victim);
  }

  async battle(): Promise<GladType> {
    let winner: GladType | null = null;

    while (!winner) {
      // eslint-disable-next-line no-await-in-loop
      await this.fight(this.glads[0], this.glads[1]);

      if (this.glads[0].hp <= 0 || this.glads[1].hp <= 0) {
        winner = this.glads[0].hp > this.glads[1].hp ? this.glads[0] : this.glads[1];
      }
    }

    return winner;
  }
}

export default BattleManager;
