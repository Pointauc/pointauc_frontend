import { MutableRefObject, ReactNode } from 'react';

import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import { WheelItem } from '@models/wheel.model';

import { WheelContext } from './wheelContextData';

interface Props {
  children: ReactNode;
  changeInitialItems: (newItems: WheelItem[]) => void;
  controller: MutableRefObject<WheelController | null>;
}

export const WheelContextProvider = ({ children, controller, changeInitialItems }: Props) => {
  return <WheelContext.Provider value={{ controller, changeInitialItems }}>{children}</WheelContext.Provider>;
};
