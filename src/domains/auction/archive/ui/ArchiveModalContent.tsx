import { Alert, Button, Group, Select, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  IconDownload,
  IconInfoCircle,
  IconPlus,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { RootState } from '@reducers/index';

import { slotsToArchivedLots } from '../lib/converters';
import {
  useArchives,
  useCreateArchive,
  useExportArchive,
  useImportArchive,
  useLoadArchive,
} from '../api/hooks';

import ArchiveList from './ArchiveList';
import styles from './ArchiveModal.module.css';

type SortOption = 'name' | 'createdAt' | 'updatedAt';

const ALERT_DISMISSED_KEY = 'archive-click-to-load-dismissed';

function ArchiveModalContent() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('archives');

  const slots = useSelector((state: RootState) => state.slots.slots);
  const { data: archives = [], isLoading } = useArchives();
  const createMutation = useCreateArchive();
  const loadMutation = useLoadArchive();
  const exportMutation = useExportArchive();
  const importMutation = useImportArchive();

  const [alertDismissed, setAlertDismissed] = useState(() => {
    return localStorage.getItem(ALERT_DISMISSED_KEY) === 'true';
  });

  const handleDismissAlert = () => {
    localStorage.setItem(ALERT_DISMISSED_KEY, 'true');
    setAlertDismissed(true);
  };

  const handleSaveCurrentAuction = () => {
    const date = dayjs().format('YYYY-MM-DD HH:mm');
    const name = t('archive.newArchiveName', { date });
    const data = { lots: slotsToArchivedLots(slots) };

    createMutation.mutate({ name, data });
  };

  const handleLoadArchive = (id: string) => {
    if (slots.length > 1) {
      if (!window.confirm(t('archive.confirmLoad.message'))) {
        return;
      }
    }
    loadMutation.mutate(id);
  };

  const handleExportSelected = () => {
    if (selectedExportId) {
      exportMutation.mutate(selectedExportId);
    }
  };

  const handleImportFile = (files: File[]) => {
    if (files[0]) {
      importMutation.mutate(files[0]);
    }
  };

  const filteredAndSortedArchives = useMemo(() => {
    let result = [...archives];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((archive) => archive.name.toLowerCase().includes(term));
    }

    // Sort
    result.sort((a, b) => {
      // Autosave always first
      if (a.isAutosave) return -1;
      if (b.isAutosave) return 1;

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [archives, searchTerm, sortBy]);

  const archiveSelectData = archives.map((archive) => ({
    value: archive.id,
    label: archive.name,
  }));

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
        <Stack gap='md'>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleSaveCurrentAuction}
            loading={createMutation.isPending}
            fullWidth
          >
            {t('archive.modal.saveButton')}
          </Button>

          <Group className={styles.searchAndSort}>
            <TextInput
              placeholder={t('archive.modal.searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              data={[
                { value: 'updatedAt', label: t('archive.item.updated', { time: '' }).trim() },
                { value: 'createdAt', label: t('archive.item.created', { time: '' }).trim() },
                { value: 'name', label: t('archive.item.rename') },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              style={{ width: 200 }}
            />
          </Group>

          {!alertDismissed && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              title={t('archive.clickToLoad.message')}
              color='blue'
              withCloseButton
              onClose={handleDismissAlert}
            />
          )}

          <div className={styles.listContainer}>
            <ArchiveList
              archives={filteredAndSortedArchives}
              onLoadArchive={handleLoadArchive}
              loadingArchiveId={loadMutation.isPending ? loadMutation.variables : undefined}
              isLoading={isLoading}
              sortBy={sortBy}
            />
          </div>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value='importExport' pt='md'>
        <Stack gap='md'>
          <div className={styles.exportSection}>
            <Select
              label={t('archive.export.title')}
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
            <Text fw={500} mb='sm'>
              {t('archive.import.title')}
            </Text>
            <Dropzone
              onDrop={handleImportFile}
              accept={['application/json']}
              maxSize={5 * 1024 * 1024}
              loading={importMutation.isPending}
            >
              <div className={styles.dropzoneContent}>
                <IconUpload className={styles.dropzoneIcon} stroke={1.5} />
                <Text size='lg' inline>
                  {t('archive.import.dropzone')}
                </Text>
                <Text size='sm' c='dimmed' inline mt={7}>
                  {t('archive.import.browse')}
                </Text>
              </div>
            </Dropzone>
          </div>
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}

export default ArchiveModalContent;

