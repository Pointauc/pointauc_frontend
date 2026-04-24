import { Text } from '@mantine/core';
import { type FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { type BackgroundType, SettingsForm } from '@models/settings.model.ts';

import CustomBackgroundPreviewCard from './background-types/custom/CustomBackgroundPreviewCard';
import CustomBackgroundSettings from './background-types/custom/CustomBackgroundSettings';
import DefaultDarkBackgroundPreviewCard from './background-types/default-dark/DefaultDarkBackgroundPreviewCard';
import GeometryBackgroundPreviewCard from './background-types/geometry/GeometryBackgroundPreviewCard';
import GeometryBackgroundSettings from './background-types/geometry/GeometryBackgroundSettings';

interface BackgroundTypeConfig {
  type: BackgroundType;
  CardComponent: FC;
  SettingsComponent?: FC;
}

const BACKGROUND_TYPES: BackgroundTypeConfig[] = [
  {
    type: 'customMedia',
    CardComponent: CustomBackgroundPreviewCard,
    SettingsComponent: CustomBackgroundSettings,
  },
  {
    type: 'default',
    CardComponent: DefaultDarkBackgroundPreviewCard,
  },
  {
    type: 'geometry',
    CardComponent: GeometryBackgroundPreviewCard,
    SettingsComponent: GeometryBackgroundSettings,
  },
];

const AuctionBackgroundSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const selectedType = useWatch({ control, name: 'backgroundType' }) ?? 'default';
  const selectedTypeConfig = BACKGROUND_TYPES.find((item) => item.type === selectedType);
  const SelectedSettingsComponent = selectedTypeConfig?.SettingsComponent;

  return (
    <div>
      <SettingsRow>
        <Text fw={700} size='md' c='dimmed'>
          {t('settings.auc.background')}
        </Text>

        <div className='flex flex-wrap items-end gap-4 pt-4'>
          {BACKGROUND_TYPES.map(({ type, CardComponent }) => (
            <CardComponent key={type} />
          ))}
        </div>
      </SettingsRow>

      {SelectedSettingsComponent ? (
        <SettingsCard nested>
          <SelectedSettingsComponent />
        </SettingsCard>
      ) : null}
    </div>
  );
};

export default AuctionBackgroundSettings;
