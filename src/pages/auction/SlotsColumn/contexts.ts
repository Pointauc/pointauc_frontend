import { createContext } from 'react';

export interface LotsColumnContextType {
  lotWidthType: 'full' | 'compact';
}

export const LotsColumnContext = createContext<LotsColumnContextType>({
  lotWidthType: 'full',
});
