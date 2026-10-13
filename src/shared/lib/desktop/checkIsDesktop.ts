import type { PointaucDesktopBridge } from './types';

export const getPointaucDesktop = (): PointaucDesktopBridge | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.pointaucDesktop;
};

export const checkIsDesktop = (): boolean => {
  return getPointaucDesktop()?.isDesktop === true;
};
