import Glad from '../Glad';

export enum GladStateEnum {
  PrepareAttack,
  Move,
  Wait,
  Seeking,
}

export abstract class GladState<GladType extends Glad> {
  abstract type: GladStateEnum;
  glad: GladType;

  constructor(glad: GladType) {
    this.glad = glad;
  }

  abstract update(dt: number): void;
}
