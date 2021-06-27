import { Slot } from '../models/slot.model';
import { getSlot, getTotalSize } from '../utils/slots.utils';

export interface SlotChance {
  name: string;
  id: string;
  chance: number;
  winsCount?: number;
}

export interface SlotChanceDifference {
  name: string;
  id: string;
  amount: number;
  originalChance: number;
  dropoutChance: number;
  chanceDifference: number;
  winsCount?: number;
}

class PredictionService {
  initialSlots: Slot[];
  slots: Slot[];
  initialChances: SlotChance[];
  dropoutRate: number;
  preserveLogs: boolean;

  constructor(slots: Slot[], preserveLogs = false, dropoutRate = 1) {
    this.initialChances = this.normalizeSlotsChances([...slots]);
    this.slots = [...slots];
    this.initialSlots = [...slots];
    this.dropoutRate = dropoutRate;
    this.preserveLogs = preserveLogs;
    // console.log(sortSlots(this.getReverseSlots([...slots])));
  }

  private getReverseSlots = (slots: Slot[]): Slot[] => {
    const totalSize = getTotalSize(slots);

    return slots.map(({ amount, ...props }) => {
      return {
        ...props,
        amount: PredictionService.getReverseSize(Number(amount), totalSize, slots.length),
      };
    });
  };

  static getReverseSize = (size: number, totalSize: number, length: number): number =>
    (1 - size / totalSize) / (length - 1);

  private getWinner = (slots: Slot[]): number => {
    const seed = Math.random();
    let restAmount = seed * getTotalSize(slots);

    if (this.preserveLogs) {
      console.log('оставшиеся лоты:');
      console.log(slots);
      console.log(`рандом - ${restAmount}`);
    }

    return slots.findIndex(({ amount }) => {
      restAmount -= Number(amount);

      return restAmount <= 0;
    });
  };

  private performIteration = (slots: Slot[]): string => {
    const updatedSlots = [...slots];
    while (updatedSlots.length > 1) {
      const winner = this.getWinner(this.getReverseSlots(updatedSlots));

      if (this.preserveLogs) {
        console.log(`${updatedSlots[winner]?.name} вылетел`);
      }

      updatedSlots.splice(winner, 1);
    }

    return updatedSlots[0].id;
  };

  normalizeWinnersData = (data: Map<string, number>, iterations: number): SlotChance[] => {
    return Array.from(data)
      .map(([id, wins]) => ({
        name: getSlot(this.slots, id)?.name || '',
        chance: (wins / iterations) * 100,
        id,
        winsCount: wins,
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
    const slots = [...this.slots];
    // console.log([...this.slots]);

    new Array(count).fill(null).forEach((_, i) => {
      if (this.preserveLogs) {
        console.log(`итерация - ${i}`);
      }

      const winner = this.performIteration([...slots]);
      const previousWins = winningMap.get(winner);

      previousWins ? winningMap.set(winner, previousWins + 1) : winningMap.set(winner, 1);
    });

    // console.log(testMap);

    return winningMap;
  };

  researchDifference = (count: number): SlotChanceDifference[] => {
    const winners = this.predictChances(count);

    return this.initialSlots.map<SlotChanceDifference>(({ name, id, amount }) => {
      const winsCount = winners.get(id) || 0;
      const dropoutChance = winsCount ? (winsCount / count) * 100 : 0;
      const originalChance = this.initialChances.find(({ id: slotId }) => id === slotId)?.chance || 0;
      const chanceDifference = dropoutChance - originalChance;

      return {
        name: name || '',
        id,
        amount: Number(amount),
        originalChance: Number(originalChance.toFixed(3)),
        dropoutChance: Number(dropoutChance.toFixed(3)),
        chanceDifference: Number(chanceDifference.toFixed(3)),
        winsCount,
      };
    });
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
}

export default PredictionService;
