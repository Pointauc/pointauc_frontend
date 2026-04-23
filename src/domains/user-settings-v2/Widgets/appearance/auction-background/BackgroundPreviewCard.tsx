import { Text, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { type ReactNode } from 'react';

import { BackgroundPreviewCardAspectRatio } from './BackgroundPreviewCard.types.ts';

const PREVIEW_CARD_HEIGHT = 150;
const PREVIEW_CARD_ASPECT_RATIO_MAP: Record<BackgroundPreviewCardAspectRatio, number> = {
  [BackgroundPreviewCardAspectRatio.Square]: 1,
  [BackgroundPreviewCardAspectRatio.Wide]: 16 / 9,
};

interface BackgroundPreviewCardProps {
  title: string;
  ariaLabel: string;
  aspectRatio: BackgroundPreviewCardAspectRatio;
  isSelected: boolean;
  children: ReactNode;
  onClick: () => void;
}

const BackgroundPreviewCard = ({
  title,
  ariaLabel,
  aspectRatio,
  isSelected,
  children,
  onClick,
}: BackgroundPreviewCardProps) => {
  const width = Math.round(PREVIEW_CARD_HEIGHT * PREVIEW_CARD_ASPECT_RATIO_MAP[aspectRatio]);

  return (
    <UnstyledButton
      type='button'
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(
        'group relative block overflow-hidden rounded-md border-2 bg-[var(--mantine-color-dark-7)] text-[var(--mantine-color-gray-0)] transition-[border-color,box-shadow,transform] duration-150 ease-in-out hover:-translate-y-px focus-visible:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mantine-primary-color-filled)]',
        isSelected
          ? 'border-[var(--mantine-primary-color-filled)] shadow-[0_0_0_1px_var(--mantine-primary-color-filled)]'
          : 'border-[var(--mantine-color-dark-4)] hover:border-[var(--mantine-primary-color-filled)] focus-visible:border-[var(--mantine-primary-color-filled)]',
      )}
      style={{ width: `${width}px`, height: `${PREVIEW_CARD_HEIGHT}px` }}
    >
      <div className='relative h-full w-full overflow-hidden rounded-[calc(var(--mantine-radius-md)-2px)]'>
        {children}
        <div className='absolute right-0 bottom-0 left-0 z-[calc(var(--mantine-z-index-overlay)+4)] translate-y-full bg-black/80 px-3 py-2 transition-transform duration-200 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0'>
          <Text size='xs' fw={600} ta='center'>
            {title}
          </Text>
        </div>
      </div>
    </UnstyledButton>
  );
};

export default BackgroundPreviewCard;
