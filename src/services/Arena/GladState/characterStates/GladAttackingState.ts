import Glad from '../../Glad';
import { GladState, GladStateEnum } from '../GladState';
import { wait } from '../../../../utils/common.utils';

export class GladAttackingState<GladType extends Glad> extends GladState<GladType> {
  type = GladStateEnum.PrepareAttack;

  constructor(glad: GladType) {
    super(glad);
    this.glad.readyToAttack = false;

    wait(this.glad.attackAnimationSpeed + 100, this.glad.ticker).then(() => {
      this.glad.state = this.glad.stateMap.getSeekingState(this.glad);
    });
  }

  update(): void {
    // this.glad.readyToAttack = true;
  }
}
