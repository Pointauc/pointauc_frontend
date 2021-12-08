import Glad from '../../Glad';
import { GladState, GladStateEnum } from '../GladState';
import { Vector2 } from '../../../../models/Arena/Glad';
import { wait } from '../../../../utils/common.utils';

export class GladRollingState<GladType extends Glad> extends GladState<GladType> {
  type = GladStateEnum.PrepareAttack;
  startPosition: Vector2;
  target: Vector2;

  constructor(glad: GladType, target: Vector2) {
    super(glad);
    this.glad.readyToAttack = false;
    this.startPosition = { x: this.glad.x, y: this.glad.y };
    this.target = target;
    this.glad.target = target;

    wait(this.glad.rollTime, this.glad.ticker).then(() => {
      this.glad.state = this.glad.stateMap.getSeekingState(this.glad);
    });
  }

  moveToTarget(): void {
    const deltaSpeed = this.glad.ticker.deltaMS / this.glad.rollTime;
    const positionChange: Vector2 = {
      x: this.target.x - this.startPosition.x,
      y: this.target.y - this.startPosition.y,
    };
    this.glad.move(positionChange.x * deltaSpeed, positionChange.y * deltaSpeed);
  }

  update(): void {
    this.moveToTarget();
  }
}
