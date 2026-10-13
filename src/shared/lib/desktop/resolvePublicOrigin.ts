import { getPointaucDesktop } from './checkIsDesktop';

export const resolvePublicOrigin = (): string => {
  const desktop = getPointaucDesktop();
  if (desktop?.publicOrigin) {
    return desktop.publicOrigin;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};
