import GenshinEffects from './effects/GenshinEffects';
import DefaultPointer from './pointer/DefaultPointer';
import GenshinPointer from './pointer/GenshinPointer';
import DefaultSpinningWheel from './spinning-wheel/DefaultSpinningWheel';
import GenshinSpinningWheel from './spinning-wheel/GenshinSpinningWheel';

import type { WheelStyle } from '@models/wheel.model';
import type { ResolvedWheelParts } from './types';

const wheelPartsRegistry: Record<WheelStyle, ResolvedWheelParts> = {
  default: {
    spinningWheel: DefaultSpinningWheel,
    pointer: DefaultPointer,
    effects: null,
  },
  genshinImpact: {
    spinningWheel: GenshinSpinningWheel,
    pointer: GenshinPointer,
    effects: GenshinEffects,
  },
};

export const resolveWheelStyle = (wheelStyle?: WheelStyle | null): WheelStyle => wheelStyle ?? 'default';

export const resolveWheelParts = (wheelStyle?: WheelStyle | null): ResolvedWheelParts =>
  wheelPartsRegistry[resolveWheelStyle(wheelStyle)];
