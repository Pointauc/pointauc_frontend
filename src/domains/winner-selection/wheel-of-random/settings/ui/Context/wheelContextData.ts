import { createContext, MutableRefObject } from 'react';

import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import { WheelItem } from '@models/wheel.model';

export interface WheelContextData {
  controller: MutableRefObject<WheelController | null>;
  changeInitialItems: (newItems: WheelItem[]) => void;
}

export const WheelContext = createContext<WheelContextData>({
  controller: { current: null },
  changeInitialItems: () => {},
});
