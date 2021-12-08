import { Key } from 'react';
import Glad from './Glad';
import { createSlot } from '../../reducers/Slots/Slots';
import BattleManager from './BattleManager';
import { TickerType } from '../../models/Arena/Glad';

class FakeTicker implements TickerType {
  callbacks: ((dt: number) => void)[] = [];
  deltaMS = 200;

  tick(): void {
    setTimeout(() => {
      this.callbacks.forEach((callback) => callback(this.deltaMS));
      if (this.callbacks.length) {
        this.tick();
      }
    }, 0);
    // return new Promise((resolve) => {
    //   let i = 0;
    //   while (i < 1000) {
    //     // console.log(this.callbacks);
    //     if (!this.callbacks.length) {
    //       resolve();
    //       return;
    //     }
    //     this.callbacks.forEach((callback) => callback(this.deltaMS));
    //
    //     // eslint-disable-next-line no-plusplus
    //     i++;
    //   }
    //   console.log('ticker end');
    //   console.log(this.callbacks);
    //   resolve();
    // });
  }

  add(callback: (dt: number) => void): void {
    this.callbacks.push(callback);
  }

  remove(callback: (dt: number) => void): void {
    const index = this.callbacks.findIndex((cb) => cb === callback);

    this.callbacks.splice(index, 1);
  }
}

const fakeTicker = new FakeTicker();

describe('Arena', () => {
  jest.setTimeout(30000);
  const initGlads = (values: number[]): Glad[] => values.map((amount) => new Glad(createSlot({ amount }), fakeTicker));

  const testCase = async (values: number[], delta = 4, count = 500): Promise<void> => {
    const glads = initGlads(values);
    const battleManager = new BattleManager(glads);
    const winsMap = new Map<Key, number>();
    glads.forEach(({ id }) => winsMap.set(id, 0));

    for (let i = 0; i < count; i++) {
      // console.log(glads);
      // eslint-disable-next-line no-await-in-loop
      const winnerPromise = battleManager.battle(fakeTicker);

      // console.log('start tick');
      // eslint-disable-next-line no-await-in-loop
      fakeTicker.tick();
      // eslint-disable-next-line no-await-in-loop
      const winner = await winnerPromise;
      // console.log(winner);

      const winsCount = (winsMap.get(winner.id) || 0) + 1;

      winsMap.set(winner.id, winsCount);
      battleManager.reset();
    }

    // console.log(Array.from(winsMap.values()));
    const chances = Array.from(winsMap.values()).map((wins) => (wins / count) * 100);
    console.log(Array.from(winsMap.values()));
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

  it('should 60x40', async () => {
    await testCase([60, 40]);
  });

  it('should 80x20', async () => {
    await testCase([80, 20]);
  });

  it('should 95x5', async () => {
    await testCase([95, 5]);
  });
});
