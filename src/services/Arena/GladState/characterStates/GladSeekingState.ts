import { Ellipse, Vector2 } from '../../../../models/Arena/Glad';
import { getAngle, isPointInEllipse } from '../../../../utils/common.utils';
import { GladState, GladStateEnum } from '../GladState';
import Glad from '../../Glad';

export class GladSeekingState<GladType extends Glad> extends GladState<GladType> {
  type = GladStateEnum.Wait;

  constructor(glad: GladType) {
    super(glad);

    this.glad.target = this.glad.enemy;
  }

  canAttackEnemy(): boolean {
    const { x, y } = this.glad.enemy!;
    const attackArea: Ellipse = {
      x: this.glad.x,
      y: this.glad.y,
      rx: this.glad.attackRange,
      ry: this.glad.attackRange / 2,
    };

    return isPointInEllipse({ x, y }, attackArea);
  }

  moveToEnemy(): void {
    const deltaSpeed = (this.glad.moveSpeed * this.glad.ticker.deltaMS) / 1000;
    const speed: Vector2 = { x: deltaSpeed, y: deltaSpeed / 2 };
    const angle = getAngle(this.glad, this.glad.enemy!);
    this.glad.move(speed.x * Math.cos(angle), speed.x * Math.sin(angle));
  }

  update(): void {
    if (this.glad.enemy) {
      if (this.canAttackEnemy()) {
        this.glad.state = this.glad.stateMap.getAttackPrepareState(this.glad);
        return;
      }

      this.moveToEnemy();
    }
  }
}
