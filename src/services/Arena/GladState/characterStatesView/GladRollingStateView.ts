import GladView from '../../GladView';
import { GladStateEnum } from '../GladState';
import { KnightAnimation } from '../../animations/animationService';
import { Vector2 } from '../../../../models/Arena/Glad';
import { GladRollingState } from '../characterStates/GladRollingState';

export class GladRollingStateView extends GladRollingState<GladView> {
  type = GladStateEnum.PrepareAttack;

  // eslint-disable-next-line @typescript-eslint/require-await
  async animateGlad(): Promise<void> {
    this.glad.avatar!.animate(KnightAnimation.Roll, this.glad.rollTime);
  }

  constructor(glad: GladView, target: Vector2) {
    super(glad, target);

    this.animateGlad();
  }
}
