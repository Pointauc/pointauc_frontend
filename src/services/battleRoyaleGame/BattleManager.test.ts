import { createRandomSlots, createSlot } from '../../reducers/Slots/Slots';
import BattleManager from './BattleManager';
import Fighter from './Fighter';

const createBattle = (values: number[]): BattleManager => {
  const fighters = values.map((amount, id) => new Fighter(createSlot({ amount, id: id.toString() })));

  return new BattleManager(fighters);
};

const collectWinners = (battleManager: BattleManager, count = 1000): number[] => {
  const map = new Map<string, number>();
  battleManager.fighters.forEach(({ id }) => map.set(id, 0));

  for (let i = 0; i < count; i++) {
    const winner = battleManager.battle().id;
    const prevWins = map.get(winner);

    if (prevWins) {
      map.set(winner, prevWins + 1);
    } else {
      map.set(winner, 1);
    }

    battleManager.reset();
  }

  console.log(Array.from(map.values()));

  return Array.from(map.values()).map((value) => (value / count) * 100);
};

describe('Battle Manager', () => {
  const testBattle = (values: number[], accuracy = 2) => {
    const battle = createBattle(values);
    const wins = collectWinners(battle);
    console.log(wins);

    wins.forEach((winChance, index) => {
      expect(winChance).toBeLessThanOrEqual(values[index] + accuracy);
      expect(winChance).toBeGreaterThanOrEqual(values[index] - accuracy);
    });
  };
  describe('1x1', () => {
    it('50x50', () => {
      testBattle([50, 50]);
    });
    it('65x35', () => {
      testBattle([65, 35]);
    });
    it('80x20', () => {
      testBattle([80, 20]);
    });
    it('95x5', () => {
      testBattle([95, 5]);
    });
  });
});
