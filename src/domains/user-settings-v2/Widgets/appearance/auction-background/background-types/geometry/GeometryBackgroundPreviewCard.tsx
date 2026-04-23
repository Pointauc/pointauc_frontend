import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SettingsForm } from '@models/settings.model.ts';

import BackgroundPreviewCard from '../../BackgroundPreviewCard';
import { BackgroundPreviewCardAspectRatio } from '../../BackgroundPreviewCard.types.ts';

import GeometryBackgroundPreview from './GeometryBackgroundPreview';

const GeometryBackgroundPreviewCard = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const background = useController({ control, name: 'background' });
  const backgroundType = useController({ control, name: 'backgroundType' });

  const handleBackgroundSelect = (): void => {
    background.field.onChange(null);
    background.field.onBlur();
    backgroundType.field.onChange('geometry');
    backgroundType.field.onBlur();
  };

  return (
    <BackgroundPreviewCard
      title={t('settings.auc.backgroundTypes.geometry')}
      ariaLabel={t('settings.auc.backgroundTypes.geometry')}
      aspectRatio={BackgroundPreviewCardAspectRatio.Square}
      isSelected={backgroundType.field.value === 'geometry'}
      onClick={handleBackgroundSelect}
    >
      <GeometryBackgroundPreview isPreview />
    </BackgroundPreviewCard>
  );
};

export default GeometryBackgroundPreviewCard;
