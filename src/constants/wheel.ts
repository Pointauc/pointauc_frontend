import { RandomPaceConfig } from '../services/SpinPaceService';

export enum WheelCommand {
  OpenReg = 'openReg',
  CloseReg = 'closeReg',
  Spin = 'spin',
  Join = 'join',
}

export const CHAT_WHEEL_PREFIX = '!w';

export const SPIN_PATH = 'M0,0,C0.102,0.044,0.157,0.377,0.198,0.554,0.33,1,0.604,1,1,1';

export const PACE_PRESETS: Record<string, RandomPaceConfig> = {
  suddenFinal: {
    allowBackStep: true,
    valueRandomZone: 600,
    xRandomZone: 0.1,
    valueDisabledZone: 0.4,
    randomOffset: 1,
    points: 0,
  },
};
