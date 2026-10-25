import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconX } from '@tabler/icons-react';

import { usePromotionBanner } from '@domains/promotions/lib/usePromotionBanner';
import { BannerPlacement } from '@domains/promotions/model/types';

export interface PromotionBannerProps {
  placement: BannerPlacement;
  className?: string;
  imageClassName?: string;
  showCloseButton?: boolean;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({
  placement,
  className,
  imageClassName,
  showCloseButton = true,
}) => {
  const { t } = useTranslation();
  const { isVisible, banner, handleClick, handleClose } = usePromotionBanner(placement);

  if (!isVisible || !banner) {
    return null;
  }

  const [width, height] = banner.creative.size.split('x').map(Number);
  const isHorizontal800 = placement === 'settings_top' || placement === 'overlays_top';
  const isAuctionIntegrations = placement === 'auction_integrations';
  const isAuctionBids = placement === 'auction_bids';

  return (
    <div
      className={`group relative block overflow-hidden rounded-lg ${
        isHorizontal800 ? 'aspect-[800/90] max-h-[90px] w-full max-w-[800px]' : ''
      } ${isAuctionIntegrations ? 'h-[90px] w-full max-w-[320px]' : ''} ${
        isAuctionBids ? 'w-[260px] max-w-full shrink-0' : ''
      } ${className ?? ''}`.trim()}
    >
      <a
        href={banner.url}
        target='_blank'
        rel='noopener sponsored'
        onClick={handleClick}
        className='focus:ring-primary block h-full w-full overflow-hidden rounded-lg focus:ring-2 focus:outline-none'
      >
        <img
          src={banner.creative.imageSrc}
          alt={t(banner.creative.altKey)}
          width={width}
          height={height}
          loading='lazy'
          className={`block rounded-lg shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 ${
            imageClassName ??
            (isAuctionIntegrations
              ? 'h-full w-full object-cover object-bottom'
              : isHorizontal800
                ? 'h-full w-full object-cover object-center'
                : isAuctionBids
                  ? 'h-auto w-[260px] max-w-full object-contain'
                  : 'h-auto w-full object-contain')
          }`}
        />
      </a>

      {showCloseButton && (
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          aria-label={t('promotions.banners.close', { defaultValue: 'Close' })}
          title={t('promotions.banners.close', { defaultValue: 'Close' })}
          className='absolute top-0 right-0 z-20 flex h-[22px] w-[22px] items-center justify-center rounded-bl-md bg-white text-gray-900 shadow-sm transition-colors hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:outline-none'
        >
          <IconX size={14} stroke={2.5} />
        </button>
      )}
    </div>
  );
};
