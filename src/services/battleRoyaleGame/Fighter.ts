import { getRandomIntInclusive } from '../../utils/common.utils';
import { Slot } from '../../models/slot.model';

class Fighter {
  hp = 100;
  damage = 50;
  readonly value: number;
  readonly name: string;
  readonly id: string;
  readonly slot: Slot;

  // eslint-disable-next-line no-useless-constructor
  constructor(slot: Slot) {
    this.value = slot.amount || 0;
    this.name = slot.name || '';
    this.id = slot.id;
    this.slot = slot;
  }

  reset = () => {
    this.hp = 100;
  };

  attack = (enemy: Fighter) => {
    // const randomValue = getRandomIntInclusive(0, this.value + enemy.value);
    // console.log(`${this.name} - ${randomValue}`);

    // if (randomValue < this.value) {
    enemy.hp -= this.damage;
    // }
  };
}

export default Fighter;
