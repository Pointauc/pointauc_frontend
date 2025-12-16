import { Button, Code, Select, Stack, Tabs, Text, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

import { useArchives, useExportArchive, useImportArchive } from '../api/hooks';
import { ArchiveData, ArchiveRecord } from '../model/types';

import styles from './ImportExport.module.css';
import ImportForm from './ImportForm';

interface ImportExportProps {
  onImport: (record: ArchiveRecord) => void;
}

function ImportExport({ onImport }: ImportExportProps) {
  const { t } = useTranslation();
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  const { data: archives = [] } = useArchives();
  const exportMutation = useExportArchive();
  const importMutation = useImportArchive();

  const handleExportSelected = () => {
    if (selectedExportId) {
      exportMutation.mutate(selectedExportId);
    }
  };

  const handleImport = (data: ArchiveData, file?: File) => {
    const name =
      file?.name.replace(/\.[^/.]+$/, '').replace(/^pointauc_/g, '') || `Imported ${new Date().toISOString()}`;
    importMutation.mutateAsync({ data, name });
  };

  const archiveSelectData = archives.map((archive) => ({
    value: archive.id,
    label: archive.name,
  }));

  return (
    <Stack gap='md'>
      <div className={styles.exportSection}>
        <Select
          label={
            <Title order={5} mb='sm'>
              {t('archive.export.title')}
            </Title>
          }
          placeholder={t('archive.export.selectArchive')}
          data={archiveSelectData}
          value={selectedExportId}
          onChange={setSelectedExportId}
          style={{ flex: 1 }}
        />
        <Button
          leftSection={<IconDownload size={16} />}
          onClick={handleExportSelected}
          disabled={!selectedExportId}
          loading={exportMutation.isPending}
          style={{ marginTop: 'auto' }}
        >
          {t('archive.export.button')}
        </Button>
      </div>

      <div className={styles.importSection}>
        <Title order={5} mb='sm'>
          {t('archive.import.title')}
        </Title>
        <ImportForm onImport={handleImport} />
      </div>
    </Stack>
  );
}

export default ImportExport;
