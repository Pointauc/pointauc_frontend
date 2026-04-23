import { Stack } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import MarblesModeCard from '@domains/user-settings-v2/Widgets/extra-modes/MarblesModeCard';
import WheelOfLuckModeCard from '@domains/user-settings-v2/Widgets/extra-modes/WheelOfLuckModeCard';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';

const ExtraModesSection = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      id='website-settings-extra-modes'
      title={t('settings.website.toc.extraModes')}
      icon={<IconSparkles size={24} />}
    >
      <Stack gap='xs'>
        <MarblesModeCard />
        <WheelOfLuckModeCard />
      </Stack>
    </SettingsSection>
  );
};

export default ExtraModesSection;
