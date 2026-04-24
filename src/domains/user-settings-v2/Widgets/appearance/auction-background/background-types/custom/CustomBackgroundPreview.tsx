import { Image, Overlay } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { calcBackgroundOpacity, calcUiElementsOpacity } from '@utils/ui/background';

interface CustomBackgroundPreviewProps {
  image?: string;
  overlayOpacity?: number;
  blur?: number;
}

const CustomBackgroundPreview = ({ image, overlayOpacity = 0, blur = 0 }: CustomBackgroundPreviewProps) => {
  const { t } = useTranslation();
  const imageOpacity = useMemo(() => calcBackgroundOpacity(overlayOpacity), [overlayOpacity]);
  const uiElementsOpacity = useMemo(() => calcUiElementsOpacity(overlayOpacity), [overlayOpacity]);

  if (!image) {
    return null;
  }

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <Image src={image} alt={t('settings.auc.backgroundAlt')} h='100%' w='100%' fit='cover' />

      <Overlay color='#242424' backgroundOpacity={imageOpacity} blur={blur / 4} />
      <div className='absolute inset-0 z-[calc(var(--mantine-z-index-overlay)-1)] grid grid-cols-[1fr_3fr_1fr] gap-2.5 p-2.5'>
        <div
          className='flex h-[40%] items-center justify-center rounded bg-[var(--mantine-color-dark-6)]'
          style={{ opacity: uiElementsOpacity }}
        />
        <div className='h-full rounded bg-[var(--mantine-color-dark-6)]' style={{ opacity: uiElementsOpacity }} />
        <div
          className='flex h-[40%] items-center justify-center rounded bg-[var(--mantine-color-dark-6)]'
          style={{ opacity: uiElementsOpacity }}
        />
      </div>
    </div>
  );
};

export default CustomBackgroundPreview;
