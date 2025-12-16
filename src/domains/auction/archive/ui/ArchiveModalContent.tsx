import { Tabs } from '@mantine/core';
import { IconDownload, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ArchiveManagement from './ArchiveManagement';
import ImportExport from './ImportExport';

function ArchiveModalContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('archives');

  const onImport = () => {
    setActiveTab('archives');
  };

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value='archives' leftSection={<IconPlus size={16} />}>
          {t('archive.modal.tabs.archives')}
        </Tabs.Tab>
        <Tabs.Tab value='importExport' leftSection={<IconDownload size={16} />}>
          {t('archive.modal.tabs.importExport')}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='archives' pt='md'>
        <ArchiveManagement />
      </Tabs.Panel>

      <Tabs.Panel value='importExport' pt='md'>
        <ImportExport onImport={onImport} />
      </Tabs.Panel>
    </Tabs>
  );
}

export default ArchiveModalContent;
