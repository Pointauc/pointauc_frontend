import { Card, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import DesktopDownloadSidebarCard from '@domains/desktop/ui/DesktopDownloadModal/DesktopDownloadSidebarCard';
import DesktopSyncSidebarCard from '@domains/desktop/ui/DesktopSyncModal/DesktopSyncSidebarCard';
import PresetEditableDropdown from '@domains/user-settings-v2/ui/PresetEditableDropdown';
import { checkIsDesktop } from '@shared/lib/desktop/checkIsDesktop';

const SettingsSidebar = () => {
  const { t } = useTranslation();
  const isDesktop = checkIsDesktop();

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

      {isDesktop ? <DesktopSyncSidebarCard /> : <DesktopDownloadSidebarCard />}
    </div>
  );
};

export default SettingsSidebar;
