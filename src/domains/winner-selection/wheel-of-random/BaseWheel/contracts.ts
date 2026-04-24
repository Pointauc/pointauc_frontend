import type { ID } from '@components/Bracket/components/model';
import type { WheelItemWithAngle } from '@models/wheel.model';
import type { RandomPaceConfig } from '@services/SpinPaceService';

export interface SpinParams {
  duration: number;
  distance?: number;
  paceConfig?: RandomPaceConfig;
  winnerId: ID;
}

export interface SpinResult {
  changedDistance: number;
  initialDistance: number;
  animate: () => Promise<void>;
}

export interface WheelController {
  getItems: () => WheelItemWithAngle[];

  clearWinner: () => void;
  spin: (params: SpinParams) => SpinResult;
  resetPosition: () => void;

  highlight: (id: ID) => void;
  resetStyles: () => void;
  eatAnimation: (id: ID, duration?: number) => Promise<void>;
}
