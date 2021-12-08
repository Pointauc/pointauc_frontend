import Glad from './Glad';
import { getRandomInclusive, getTotal } from '../../utils/common.utils';
import { TickerType } from '../../models/Arena/Glad';

class BattleManager<GladType extends Glad> {
  private _stopUpdates?: () => void;
  winner?: GladType;
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

  async fight(): Promise<void> {
    const [first, second] = this.glads;
    // console.log(first.x);
    // console.log(first.y);
    // console.log(first.state);
    // console.log('fight');
    if (first.readyToAttack && second.readyToAttack) {
      const winner = this.getWinner([first, second]);
      // console.log(`fight success ${winner === first ? 0 : 1}`);
      const victim = winner === first ? second : first;

      await winner.attack(victim);

      if (this.glads[0].hp <= 0 || this.glads[1].hp <= 0) {
        this.winner = this.glads[0].hp > this.glads[1].hp ? this.glads[0] : this.glads[1];
      }
    }
  }

  setupPositions(): void {
    this.winner = undefined;
    const width = 1100;
    const height = 800;
    const gladsPlacementRadius = 500;
    const xOffset = width / 2 - gladsPlacementRadius;
    this.glads[0].x = xOffset + gladsPlacementRadius * 2;
    this.glads[1].x = xOffset - gladsPlacementRadius * 2;
    this.glads[0].y = height / 2 + 100;
    this.glads[1].y = height / 2 + 100;
  }

  async battle(ticker: TickerType): Promise<GladType> {
    return new Promise((resolve) => {
      this.glads[0].setEnemy(this.glads[1]);
      this.glads[1].setEnemy(this.glads[0]);
      const update = (): void => {
        this.fight();

        if (this.winner) {
          // console.log('winner');
          this.stopUpdates();
          resolve(this.winner);
        }
      };

      ticker.add(update);

      this.glads[0].startAI();
      this.glads[1].startAI();

      this._stopUpdates = () => ticker.remove(update);
    });
  }

  stopUpdates(): void {
    this.glads[0].stopUpdates();
    this.glads[1].stopUpdates();
    this._stopUpdates && this._stopUpdates();
    this._stopUpdates = undefined;
  }
}

export default BattleManager;
