import { IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SettingsForm } from '@models/settings.model.ts';

import BackgroundPreviewCard from '../../BackgroundPreviewCard';
import { BackgroundPreviewCardAspectRatio } from '../../BackgroundPreviewCard.types.ts';

import BackgroundImageModal from './BackgroundImageModal';
import CustomBackgroundPreview from './CustomBackgroundPreview';

const CustomBackgroundPreviewCard = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const background = useController({ control, name: 'background' });
  const backgroundType = useController({ control, name: 'backgroundType' });
  const overlayOpacity = useWatch({ control, name: 'backgroundOverlayOpacity' }) ?? 0;
  const blur = useWatch({ control, name: 'backgroundBlur' }) ?? 0;
  const [isImageModalOpened, imageModalHandlers] = useDisclosure(false);

  const hasBackground = Boolean(background.field.value);
  const isSelected = backgroundType.field.value === 'customMedia';

  const handleImageChange = (image: string): void => {
    background.field.onChange(image);
    background.field.onBlur();
    backgroundType.field.onChange('customMedia');
    backgroundType.field.onBlur();
  };

  return (
    <>
      <BackgroundPreviewCard
        title={t('settings.auc.backgroundTypes.customMedia')}
        ariaLabel={t('settings.auc.backgroundTypes.customMedia')}
        aspectRatio={BackgroundPreviewCardAspectRatio.Wide}
        isSelected={isSelected}
        onClick={imageModalHandlers.open}
      >
        <div className='relative h-full w-full overflow-hidden'>
          {hasBackground ? (
            <CustomBackgroundPreview
              image={background.field.value ?? undefined}
              overlayOpacity={overlayOpacity}
              blur={blur}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-[var(--mantine-color-dark-7)] text-[var(--mantine-color-dark-2)]'>
              <IconPlus size={64} stroke={1.6} />
            </div>
          )}
          {hasBackground ? (
            <div className='absolute inset-0 z-[calc(var(--mantine-z-index-overlay)+3)] flex items-center justify-center bg-black/50 text-[var(--mantine-color-gray-0)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100'>
              <IconPlus size={58} stroke={1.7} />
            </div>
          ) : null}
        </div>
      </BackgroundPreviewCard>

      <BackgroundImageModal
        isOpened={isImageModalOpened}
        onClose={imageModalHandlers.close}
        onChange={handleImageChange}
      />
    </>
  );
};

export default CustomBackgroundPreviewCard;
