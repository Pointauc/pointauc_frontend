import GladView from '../../GladView';
import { GladAttackingStateView } from './GladAttackingStateView';
import { GladReceiveDamageStateView } from './GladReceiveDamageStateView';
import { GladPrepareAttackStateView } from './GladPrepareAttackStateView';
import { GladSeekingStateView } from './GladSeekingStateView';
import { GladRollingStateView } from './GladRollingStateView';
import { GladStateMap } from '../characterStates/GladStateMap';

export const gladViewStateMap: GladStateMap<GladView> = {
  getAttackingState: (glad) => new GladAttackingStateView(glad),
  getDamageReceivingState: (glad, knockBack) => new GladReceiveDamageStateView(glad, knockBack),
  getAttackPrepareState: (glad) => new GladPrepareAttackStateView(glad),
  getSeekingState: (glad) => new GladSeekingStateView(glad),
  getRollinState: (glad, target) => new GladRollingStateView(glad, target),
};
