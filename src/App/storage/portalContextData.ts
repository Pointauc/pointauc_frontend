import { createContext } from 'react';

export interface PortalContextData {
  portalRoot: HTMLDivElement | null;
}

export const findPortalRoot = () => {
  return document.querySelector('[data-portal="true"]') as HTMLDivElement;
};

export const PortalContext = createContext<PortalContextData>({ portalRoot: findPortalRoot() });
