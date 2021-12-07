import * as PIXI from 'pixi.js';
import { Vector2 } from '../../../models/Arena/Glad';
import globalParticleService from './globalParticleService';

export default class BloodFountain {
  reservedBlood = 0;
  callback: (dt: number) => void;

  constructor(position: Vector2, bloodsPerSecond: number) {
    const amountForNewCell = 1000 / bloodsPerSecond;
    this.callback = (dt: number): void => {
      this.reservedBlood += dt * 100;
      const newCells = Math.floor(this.reservedBlood / amountForNewCell);

      this.reservedBlood -= newCells * amountForNewCell;
      globalParticleService.blood.splat(position, newCells);
    };
    PIXI.Ticker.shared.add(this.callback);
  }

  destroy(): void {
    PIXI.Ticker.shared.remove(this.callback);
  }
}
