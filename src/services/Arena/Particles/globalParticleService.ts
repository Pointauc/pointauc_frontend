import * as PIXI from 'pixi.js';
import BloodParticleService from './BloodParticleService';

class GlobalParticleService {
  blood: BloodParticleService;

  constructor() {
    this.blood = new BloodParticleService();
  }

  setup(container: PIXI.Container): void {
    this.blood.setup(container);
  }

  prepareLoad(): void {
    PIXI.Loader.shared.add(`${process.env.PUBLIC_URL}/arena/particles/particles.json`);
  }
}

export default new GlobalParticleService();
