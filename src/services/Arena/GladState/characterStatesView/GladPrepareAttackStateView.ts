import GladView from '../../GladView';
import { GladStateEnum } from '../GladState';
import { GladPrepareAttackState } from '../characterStates/GladPrepareAttackState';

export class GladPrepareAttackStateView extends GladPrepareAttackState<GladView> {
  type = GladStateEnum.PrepareAttack;

  constructor(glad: GladView) {
    super(glad);

    this.glad.avatar!.idle();
  }

  update(): void {
    // this.glad.readyToAttack = true;
  }
}
