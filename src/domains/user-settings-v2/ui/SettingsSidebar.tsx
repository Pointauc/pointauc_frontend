import { Card, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import PresetEditableDropdown from '@domains/user-settings-v2/ui/PresetEditableDropdown';

const SettingsSidebar = () => {
  const { t } = useTranslation();

  return (
    <Stack gap='md'>
      <Card withBorder radius='md' shadow='sm' p='sm' bg='dark.7'>
        <Stack gap='sm'>
          <Stack gap={2}>
            <Text component='h3' fw={700} size='md'>
              {t('settings.website.presets.title')}
            </Text>
            <Text size='sm' c='dimmed'>
              {t('settings.website.presets.description')}
            </Text>
          </Stack>

          <PresetEditableDropdown />
        </Stack>
      </Card>
    </Stack>
  );
};

export default SettingsSidebar;
