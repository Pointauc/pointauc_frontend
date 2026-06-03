import { createContext, RefObject, useContext } from 'react';

export interface ScrollContextData {
  elementRef: RefObject<HTMLDivElement | null>;
}

export const ScrollContext = createContext<ScrollContextData>({
  elementRef: { current: null },
});

export const useScrollContext = (): ScrollContextData => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollContextProvider');
  }
  return context;
};
