import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePromotionBanner } from '@domains/promotions/lib/usePromotionBanner';
import { BannerPlacement } from '@domains/promotions/model/types';

export interface PromotionBannerProps {
  placement: BannerPlacement;
  className?: string;
  imageClassName?: string;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({ placement, className, imageClassName }) => {
  const { t } = useTranslation();
  const { isVisible, banner, handleClick } = usePromotionBanner(placement);

  if (!isVisible || !banner) {
    return null;
  }

  const [width, height] = banner.creative.size.split('x').map(Number);
  const isHorizontal800 = placement === 'settings_top' || placement === 'overlays_top';

  return (
    <a
      href={banner.url}
      target='_blank'
      rel='noopener sponsored'
      onClick={handleClick}
      className={`group focus:ring-primary block overflow-hidden rounded-lg transition-transform hover:scale-[1.01] focus:ring-2 focus:outline-none ${
        isHorizontal800 ? 'aspect-[800/90] max-h-[90px] w-full max-w-[800px]' : ''
      } ${className ?? ''}`.trim()}
    >
      <img
        src={banner.creative.imageSrc}
        alt={t(banner.creative.altKey)}
        width={width}
        height={height}
        loading='lazy'
        className={`block rounded-lg shadow-sm transition-opacity group-hover:opacity-95 ${
          imageClassName ??
          (isHorizontal800 ? 'h-full w-full object-cover object-center' : 'h-auto w-full object-contain')
        }`}
      />
    </a>
  );
};
