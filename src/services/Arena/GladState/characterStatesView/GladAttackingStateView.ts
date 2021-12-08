import GladView from '../../GladView';
import { GladStateEnum } from '../GladState';
import { KnightAnimation } from '../../animations/animationService';
import { GladAttackingState } from '../characterStates/GladAttackingState';

export class GladAttackingStateView extends GladAttackingState<GladView> {
  type = GladStateEnum.PrepareAttack;

  constructor(glad: GladView) {
    super(glad);

    this.glad.avatar?.animate(KnightAnimation.Attack, this.glad.attackAnimationSpeed, true);
  }

  update(): void {
    // this.glad.readyToAttack = true;
  }
}
