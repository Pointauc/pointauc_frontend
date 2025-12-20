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

interface SlotLike {
  amount?: number | null;
  id: string;
  name?: string | null;
}

export const getSlotFromSeed = (slots: SlotLike[], distance: number): number => {
  let restAmount = distance * getTotalSize(slots);

  const index = slots.findIndex(({ amount }) => {
    restAmount -= Number(amount ?? 0);

    return restAmount <= 0;
  });

  return index >= 0 ? index : slots.length - 1;
};

class PredictionService {
  initialSlots: SlotLike[];
  initialChances: SlotChance[];
  preserveLogs: boolean;
  getWinnerId: (slots: SlotLike[]) => Promise<string>;

  constructor(slots: SlotLike[], getWinnerId: (slots: SlotLike[]) => Promise<string>, preserveLogs = false) {
    this.initialChances = this.normalizeSlotsChances([...slots]);
    this.initialSlots = [...slots];
    this.preserveLogs = preserveLogs;
    this.getWinnerId = getWinnerId;
    // console.log(sortSlots(this.getReverseSlots([...slots])));
  }

  private getWinner = async (slots: SlotLike[]): Promise<SlotLike> => {
    const winnerId = await this.getWinnerId(slots);
    return slots.find((slot) => slot.id === winnerId) as SlotLike;
  };

  normalizeWinnersData = (data: Map<string, number>, iterations: number): SlotChance[] => {
    return Array.from(data)
      .map(([id, wins]) => ({
        name: getSlot(this.initialSlots as Slot[], id)?.name || '',
        chance: (wins / iterations) * 100,
        id,
        winsCount: wins,
      }))
      .sort(({ chance: a }, { chance: b }) => b - a);
  };

  normalizeSlotsChances = (slots: SlotLike[]): SlotChance[] => {
    const total = getTotalSize(slots);
    return slots
      .map<SlotChance>(({ amount, name, id }) => ({ id, chance: (Number(amount) / total) * 100, name: name || '' }))
      .sort(({ chance: a }, { chance: b }) => b - a);
  };

  getChance = (chances: SlotChance[], slotId: string): number => chances.find(({ id }) => id === slotId)?.chance || 0;

  getChanceDifference = (a: SlotChance[], b: SlotChance[]): SlotChance[] => {
    return a.map(({ name, chance, id }) => ({ id, name, chance: chance - this.getChance(b, id) }));
  };

  predictChances = async (count: number): Promise<Map<string, number>> => {
    const winningMap = new Map<string, number>();
    const slots = [...this.initialSlots];
    // console.log([...this.slots]);

    const promises = new Array(count).fill(null).map(async (_, i) => {
      if (this.preserveLogs) {
        console.log(`итерация - ${i}`);
      }

      const winner = await this.getWinner(slots);
      // console.log('winner', winner);
      const previousWins = winningMap.get(winner.id);

      previousWins ? winningMap.set(winner.id, previousWins + 1) : winningMap.set(winner.id, 1);
    });

    await Promise.all(promises);

    // console.log(testMap);

    return winningMap;
  };

  researchDifference = async (count: number): Promise<SlotChanceDifference[]> => {
    const winners = await this.predictChances(count);
    // console.log('winners', winners);

    return this.initialSlots.map<SlotChanceDifference>(({ name, id, amount }) => {
      const winsCount = winners.get(id) ?? 0;
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
    const index = this.initialSlots.findIndex(({ id }) => slotId === id);

    if (index >= 0) {
      const { amount } = this.initialSlots[index];
      const amountChange = (Number(amount) * diff) / 50;
      // console.log(`${name} - ${diff} - ${amountChange}`);
      this.initialSlots[index] = { ...this.initialSlots[index], amount: Number(amount) - amountChange };
    }
  };
}

export default PredictionService;
