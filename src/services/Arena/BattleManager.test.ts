import { Key } from 'react';
import Glad from './Glad';
import { createSlot } from '../../reducers/Slots/Slots';
import BattleManager from './BattleManager';

describe('Arena', () => {
  const initGlads = (values: number[]): Glad[] => values.map((amount) => new Glad(createSlot({ amount })));

  const testCase = async (values: number[], delta = 5, count = 5000): Promise<void> => {
    const glads = initGlads(values);
    const battleManager = new BattleManager(glads);
    const winsMap = new Map<Key, number>();
    glads.forEach(({ id }) => winsMap.set(id, 0));

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      const winner = await battleManager.battle();
      const winsCount = (winsMap.get(winner.id) || 0) + 1;

      winsMap.set(winner.id, winsCount);
      battleManager.reset();
    }

    // console.log(Array.from(winsMap.values()));
    const chances = Array.from(winsMap.values()).map((wins) => (wins / count) * 100);
    console.log(chances);

    chances.forEach((chance, index) => {
      expect(chance).toBeGreaterThanOrEqual(Math.max(values[index] - delta, 1));
      expect(chance).toBeLessThanOrEqual(Math.min(values[index] + delta, 99));
    });
  };

  it('should 50x50', async () => {
    await testCase([50, 50]);
  });

  it('should 65x35', async () => {
    await testCase([65, 35]);
  });

  it('should 80x20', async () => {
    await testCase([80, 20]);
  });

  it('should 95x5', async () => {
    await testCase([95, 5]);
  });
});
