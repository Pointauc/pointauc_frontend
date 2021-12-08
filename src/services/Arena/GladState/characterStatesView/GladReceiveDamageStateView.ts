import GladView from '../../GladView';
import { GladStateEnum } from '../GladState';
import { KnightAnimation } from '../../animations/animationService';
import { GladReceiveDamageState } from '../characterStates/GladReceiveDamageState';

export class GladReceiveDamageStateView extends GladReceiveDamageState<GladView> {
  type = GladStateEnum.PrepareAttack;

  async animateGlad(): Promise<void> {
    if (this.glad.hp <= 0) {
      await this.glad.animateDeath();
    } else {
      await this.glad.avatar!.animate(KnightAnimation.Shield, this.glad.damageReceiveAnimationSpeed);
    }
  }

  constructor(glad: GladView, knockBack = 0) {
    super(glad, knockBack);

    this.animateGlad();
  }
}
