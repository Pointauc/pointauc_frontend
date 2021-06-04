import { Slot } from '../models/slot.model';
import { getSlot, getTotalSize } from '../utils/slots.utils';
import { sortSlots } from '../utils/common.utils';

export interface SlotChance {
  name: string;
  id: string;
  chance: number;
  count?: number;
}

class PredictionService {
  initialSlots: Slot[];
  slots: Slot[];
  initialChances: SlotChance[];
  dropoutRate: number;

  constructor(slots: Slot[], dropoutRate = 1) {
    this.initialChances = this.normalizeSlotsChances([...slots]);
    this.slots = [...slots];
    this.initialSlots = [...slots];
    this.dropoutRate = dropoutRate;
    console.log(sortSlots(this.getReverseSlots([...slots])));
  }

  private getReverseSlots = (slots: Slot[]): Slot[] => {
    const upperSlots = slots.map(({ amount, ...rest }) => ({ ...rest, amount: Number(amount) ** 3 }));
    const totalSize = getTotalSize(upperSlots);

    return upperSlots.map(({ amount, ...props }) => {
      return {
        ...props,
        amount: this.getReverseSize(Number(amount), totalSize),
      };
    });
  };

  private getReverseSize = (size: number, totalSize: number): number => ((1 - size / totalSize) * 10) ** 3;

  private getWinner = (slots: Slot[]): number => {
    // console.log(getTotalSize(slots));
    const seed = Math.random();
    let restAmount = seed * getTotalSize(slots);
    // console.log(seed);
    // console.log(restAmount);
    // console.log(slots);
    // console.log(getTotalSize(slots));
    // const value = Math.floor(seed * 10);
    // const previousWins = testMap.get(value);
    //
    // previousWins ? testMap.set(value, previousWins + 1) : testMap.set(value, 1);

    return slots.findIndex(({ amount }) => {
      restAmount -= Number(amount);
      // console.log(`cur${name}, left ${restAmount}`);

      return restAmount <= 0;
    });
  };

  private performIteration = (slots: Slot[]): string => {
    while (slots.length > 1) {
      // console.log([...slots]);
      const winner = this.getWinner(slots);

      // console.log(`${[...slots][winner]?.name} (index - ${winner})`);
      slots.splice(winner, 1);
    }

    return slots[0].id;
  };

  normalizeWinnersData = (data: Map<string, number>, iterations: number): SlotChance[] => {
    return Array.from(data)
      .map(([id, wins]) => ({
        name: getSlot(this.slots, id)?.name || '',
        chance: (wins / iterations) * 100,
        id,
        count: wins,
      }))
      .sort(({ chance: a }, { chance: b }) => b - a);
  };

  normalizeSlotsChances = (slots: Slot[]): SlotChance[] => {
    const total = getTotalSize(slots);
    return slots
      .map<SlotChance>(({ amount, name, id }) => ({ id, chance: (Number(amount) / total) * 100, name: name || '' }))
      .sort(({ chance: a }, { chance: b }) => b - a);
  };

  getChance = (chances: SlotChance[], slotId: string): number => chances.find(({ id }) => id === slotId)?.chance || 0;

  getChanceDifference = (a: SlotChance[], b: SlotChance[]): SlotChance[] => {
    return a.map(({ name, chance, id }) => ({ id, name, chance: chance - this.getChance(b, id) }));
  };

  predictChances = (count: number): Map<string, number> => {
    const winningMap = new Map<string, number>();
    const slots = this.getReverseSlots([...this.slots]);
    // console.log([...this.slots]);

    new Array(count).fill(null).forEach(() => {
      // const slots = shuffle([...this.slots]);
      // const win = this.getWinner(slots);
      const winner = this.performIteration([...slots]);
      // console.log(`${[...slots][win]?.name} (index - ${win})`);
      const previousWins = winningMap.get(winner);

      previousWins ? winningMap.set(winner, previousWins + 1) : winningMap.set(winner, 1);
    });

    // console.log(testMap);

    return winningMap;
  };

  researchDifference = (count: number): SlotChance[] => {
    const winners = this.predictChances(count);
    const winnerChances = this.normalizeWinnersData(winners, count);

    // console.log(this.initialChances);
    // console.log(winnerChances);
    console.log(this.initialChances);
    console.log(winnerChances);

    console.log(this.getChanceDifference(winnerChances, this.initialChances));

    return this.getChanceDifference(winnerChances, this.initialChances);
  };

  updateAmount = (slotId: string, diff: number): void => {
    const index = this.slots.findIndex(({ id }) => slotId === id);

    if (index >= 0) {
      const { amount } = this.slots[index];
      const amountChange = (Number(amount) * diff) / 50;
      // console.log(`${name} - ${diff} - ${amountChange}`);
      this.slots[index] = { ...this.slots[index], amount: Number(amount) - amountChange };
    }
  };

  correctAmount = (iteration: number, count: number): Slot[] => {
    new Array(iteration).fill(null).forEach(() => {
      console.log('start iteration');
      const diffData = this.researchDifference(count);

      diffData.forEach(({ id, chance }) => this.updateAmount(id, chance));
    });

    console.log(sortSlots(this.getReverseSlots(this.slots)));

    return [...this.slots];
  };
}

export default PredictionService;
