import PredictionService, { SlotChance } from './PredictionService';
import { Slot } from '../models/slot.model';
import { getRandomIntInclusive, getUniqItems, randomizeItem } from '../utils/common.utils';
import { getTotalSize } from '../utils/slots.utils';
import Fighter from './battleRoyaleGame/Fighter';
import BattleManager from './battleRoyaleGame/BattleManager';
import { createSlot } from '../reducers/Slots/Slots';

class BattleRoyalePredictionService extends PredictionService {
  augmentSlot = (slots: Slot[], amount: number): Slot[] => {
    const index = getRandomIntInclusive(0, slots.length - 1);
    const copy = [...slots];
    copy[index] = { ...copy[index], amount: Number(copy[index].amount) * amount };

    return copy;
  };

  public prepareSlots = (slots: Slot[]): Slot[] => {
    return new Array(5).fill(null).reduce((accum) => this.augmentSlot(accum, 1.1), slots);
  };

  protected getFighters = (slots: Map<string, Slot>): Slot[] => {
    return getUniqItems(Array.from(slots.values()), 4);
  };

  protected teamFight = (slots: Slot[]): Slot[] => {
    const teams = [
      [slots[0], slots[1]],
      [slots[2], slots[3]],
    ];

    return teams[randomizeItem(teams, ([a, b]) => Number(a.amount) + Number(b.amount))];
  };

  protected ffa = (slots: Slot[]): Slot[] => {
    return [slots[this.getWinner(slots)]];
  };

  protected dropout = (slots: Slot[]): Slot[] => {
    const copy = [...slots];
    copy.splice(this.getWinner(this.getReverseSlots(copy)), 1);
    copy.splice(this.getWinner(this.getReverseSlots(copy)), 1);

    return copy;
  };

  protected fight = (slots: Slot[]): Slot[] => {
    if (slots.length === 4) {
      const mode = getRandomIntInclusive(0, 2);

      switch (mode) {
        case 0:
          return this.ffa(slots);
        case 1:
          return this.dropout(slots);
        case 2:
          return this.teamFight(slots);
        default:
      }
    }

    return this.ffa(slots);
  };

  protected performIteration = (slots: Slot[]): string => {
    // const preparedSlots = this.prepareSlots(slots);
    const currentSlots = slots.reduce((map, slot) => map.set(slot.id, slot), new Map<string, Slot>());
    while (currentSlots.size > 1) {
      const fighters = this.getFighters(currentSlots);

      const winners = this.fight(fighters);
      const losers = fighters.filter((slot) => !winners.includes(slot));
      const reward = getTotalSize(losers);
      const winnersTotal = fighters.length === 4 ? getTotalSize(winners) : getTotalSize(fighters);
      // console.log('---------------------------------------------------------------');
      // console.log(fighters);
      // console.log(winners);
      // console.log(losers);
      winners.forEach((slot) => {
        currentSlots.set(slot.id, {
          ...slot,
          amount: Number(slot.amount) + reward * (Number(slot.amount) / winnersTotal),
        });
      });
      losers.forEach((slot) => {
        currentSlots.delete(slot.id);
      });
      // console.log(Array.from(currentSlots.values()));
    }

    return Array.from(currentSlots)[0][1].id;
  };
}

export default BattleRoyalePredictionService;
