import { ReactNode, useRef } from 'react';

import { ScrollContext } from '@shared/lib/scrollContext';

interface ScrollContextProviderProps {
  children: ReactNode;
}

export const ScrollContextProvider: React.FC<ScrollContextProviderProps> = ({ children }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  return <ScrollContext.Provider value={{ elementRef }}>{children}</ScrollContext.Provider>;
};
