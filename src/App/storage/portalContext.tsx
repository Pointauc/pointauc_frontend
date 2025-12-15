import { createContext, useLayoutEffect, useMemo, useState } from 'react';

interface PortalContextData {
  portalRoot: HTMLDivElement | null;
}

const findPortalRoot = () => {
  return document.querySelector('[data-portal="true"]') as HTMLDivElement;
};

export const PortalContext = createContext<PortalContextData>({ portalRoot: findPortalRoot() });

interface PortalContextProviderProps {
  children: React.ReactNode;
}

export const PortalContextProvider: React.FC<PortalContextProviderProps> = ({ children }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setPortalRoot(findPortalRoot());
  }, [portalRoot]);

  return <PortalContext.Provider value={{ portalRoot }}>{children}</PortalContext.Provider>;
};
