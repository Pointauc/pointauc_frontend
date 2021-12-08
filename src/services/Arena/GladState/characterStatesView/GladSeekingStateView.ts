import GladView from '../../GladView';
import { KnightAnimation } from '../../animations/animationService';
import { GladSeekingState } from '../characterStates/GladSeekingState';

export class GladSeekingStateView extends GladSeekingState<GladView> {
  moveToEnemy() {
    super.moveToEnemy();

    if (!this.glad.avatar!.playing) {
      this.glad.avatar?.animate(KnightAnimation.Run, 300, false);
      this.glad.avatar!.loop = true;
    }
  }
}
