import i18n from '@assets/i18n/index';
import { resolvePublicOrigin } from '@shared/lib/desktop/resolvePublicOrigin';

interface LinkParams {
  id: string;
  token: string;
}

export const buildOverlayLink = (params: LinkParams): string => {
  const currentLanguage = i18n.language;
  return `${resolvePublicOrigin()}/overlays/view/${params.id}?token=${params.token}&locale=${currentLanguage}`;
};
