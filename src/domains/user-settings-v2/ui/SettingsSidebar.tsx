import { Card, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import PresetEditableDropdown from '@domains/user-settings-v2/ui/PresetEditableDropdown';

const SettingsSidebar = () => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col gap-4'>
      <Card withBorder radius='md' shadow='sm' p='sm' bg='dark.8'>
        <div className='flex flex-col gap-2.5'>
          <div className='flex flex-col gap-0.5'>
            <Text component='h3' fw={700} size='md'>
              {t('settings.website.presets.title')}
            </Text>
            <Text size='sm' c='dimmed'>
              {t('settings.website.presets.description')}
            </Text>
          </div>

          <PresetEditableDropdown />
        </div>
      </Card>
    </div>
  );
};

export default SettingsSidebar;
