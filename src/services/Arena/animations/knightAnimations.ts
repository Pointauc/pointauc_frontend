import { AnimationMap, SheetScheme } from '../../../models/Arena/Glad';
import knightIdle from '../../../assets/arena/animations/knight/KnightIdle.png';

const KnightIdleScheme: SheetScheme = { width: 64, height: 64, frames: 15 };

const knightAnimations: AnimationMap = {
  idle: { sheet: knightIdle, scheme: KnightIdleScheme },
};

export default knightAnimations;
