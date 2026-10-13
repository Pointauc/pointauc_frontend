import { getPointaucDesktop } from './checkIsDesktop';

export const openExternalUrl = async (url: string): Promise<void> => {
  const desktop = getPointaucDesktop();
  if (desktop) {
    await desktop.openExternal(url);
    return;
  }

  window.open(url, '_blank');
};
