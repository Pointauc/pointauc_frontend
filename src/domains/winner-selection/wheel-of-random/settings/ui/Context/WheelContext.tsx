import { createContext, MutableRefObject, ReactNode } from 'react';

import { WheelItem } from '@models/wheel.model';
import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';

export interface WheelContextData {
  controller: MutableRefObject<WheelController | null>;
  changeInitialItems: (newItems: WheelItem[]) => void;
}

export const WheelContext = createContext<WheelContextData>({
  controller: { current: null },
  changeInitialItems: () => {},
});

interface Props {
  children: ReactNode;
  changeInitialItems: (newItems: WheelItem[]) => void;
  controller: MutableRefObject<WheelController | null>;
}

export const WheelContextProvider = ({ children, controller, changeInitialItems }: Props) => {
  return <WheelContext.Provider value={{ controller, changeInitialItems }}>{children}</WheelContext.Provider>;
};
