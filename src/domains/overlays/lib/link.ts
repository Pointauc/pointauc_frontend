import i18n from '@assets/i18n/index';

interface LinkParams {
  id: string;
  token: string;
}

export const buildOverlayLink = (params: LinkParams) => {
  const currentLanguage = i18n.language;
  return `${window.location.origin}/overlays/view/${params.id}?token=${params.token}&locale=${currentLanguage}`;
};
