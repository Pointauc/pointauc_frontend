import { GladState } from '../GladState';
import Glad from '../../Glad';
import { GladAttackingState } from './GladAttackingState';
import { GladReceiveDamageState } from './GladReceiveDamageState';
import { GladPrepareAttackState } from './GladPrepareAttackState';
import { GladSeekingState } from './GladSeekingState';
import { Vector2 } from '../../../../models/Arena/Glad';
import { GladRollingState } from './GladRollingState';

export interface GladStateMap<T extends Glad> {
  getAttackingState: (glad: T) => GladState<T>;
  getDamageReceivingState: (glad: T, knockBack?: number) => GladState<T>;
  getAttackPrepareState: (glad: T) => GladState<T>;
  getSeekingState: (glad: T) => GladState<T>;
  getRollinState: (glad: T, target: Vector2) => GladState<T>;
}

export const gladStateMap: GladStateMap<Glad> = {
  getAttackingState: (glad) => new GladAttackingState(glad),
  getDamageReceivingState: (glad, knockBack) => new GladReceiveDamageState(glad, knockBack),
  getAttackPrepareState: (glad) => new GladPrepareAttackState(glad),
  getSeekingState: (glad) => new GladSeekingState(glad),
  getRollinState: (glad, target) => new GladRollingState(glad, target),
};
