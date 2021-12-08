import Glad from '../../Glad';
import { GladState, GladStateEnum } from '../GladState';
import { wait } from '../../../../utils/common.utils';

export class GladPrepareAttackState<GladType extends Glad> extends GladState<GladType> {
  type = GladStateEnum.PrepareAttack;

  constructor(glad: GladType) {
    super(glad);

    wait(this.glad.recoverySpeed, this.glad.ticker).then(() => {
      this.glad.readyToAttack = true;
    });
  }

  update(): void {
    // this.glad.readyToAttack = true;
  }
}
