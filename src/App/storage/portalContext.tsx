import { useLayoutEffect, useState } from 'react';

import { findPortalRoot, PortalContext } from '@App/storage/portalContextData';

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
