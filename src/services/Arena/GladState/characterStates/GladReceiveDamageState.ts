import Glad from '../../Glad';
import { GladState, GladStateEnum } from '../GladState';
import { Vector2 } from '../../../../models/Arena/Glad';
import { getAngle, wait } from '../../../../utils/common.utils';

export class GladReceiveDamageState<GladType extends Glad> extends GladState<GladType> {
  type = GladStateEnum.PrepareAttack;
  knockBackSpeed: number;
  shouldKnockBack?: boolean;

  async applyKnockBack(): Promise<void> {
    this.shouldKnockBack = true;
    await wait(this.glad.damageReceiveAnimationSpeed, this.glad.ticker);
    this.shouldKnockBack = false;
  }

  moveByKnockBack(): void {
    const deltaSpeed = (this.knockBackSpeed * this.glad.ticker.deltaMS) / 1000;
    const speed: Vector2 = { x: deltaSpeed, y: deltaSpeed / 2 };
    const angle = getAngle(this.glad, this.glad.enemy!);

    this.glad.move(-speed.x * Math.cos(angle), -speed.x * Math.sin(angle));
  }

  constructor(glad: GladType, knockBack = 0) {
    super(glad);
    this.glad.readyToAttack = false;
    this.knockBackSpeed = (knockBack * 1000) / this.glad.damageReceiveAnimationSpeed;
    this.applyKnockBack();

    wait(this.glad.damageReceiveAnimationSpeed, this.glad.ticker).then(() => {
      this.glad.state = this.glad.stateMap.getSeekingState(this.glad);
    });
  }

  update(): void {
    if (this.shouldKnockBack) {
      this.moveByKnockBack();
    }
  }
}
