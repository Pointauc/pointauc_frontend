import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SettingsForm } from '@models/settings.model.ts';

import BackgroundPreviewCard from '../../BackgroundPreviewCard';
import { BackgroundPreviewCardAspectRatio } from '../../BackgroundPreviewCard.types.ts';

import DefaultDarkBackgroundPreview from './DefaultDarkBackgroundPreview';

const DefaultDarkBackgroundPreviewCard = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const background = useController({ control, name: 'background' });
  const backgroundType = useController({ control, name: 'backgroundType' });

  const handleBackgroundReset = (): void => {
    background.field.onChange(null);
    background.field.onBlur();
    backgroundType.field.onChange('default');
    backgroundType.field.onBlur();
  };

  return (
    <BackgroundPreviewCard
      title={t('settings.auc.backgroundTypes.default')}
      ariaLabel={t('settings.auc.backgroundTypes.default')}
      aspectRatio={BackgroundPreviewCardAspectRatio.Square}
      isSelected={backgroundType.field.value === 'default'}
      onClick={handleBackgroundReset}
    >
      <DefaultDarkBackgroundPreview />
    </BackgroundPreviewCard>
  );
};

export default DefaultDarkBackgroundPreviewCard;
