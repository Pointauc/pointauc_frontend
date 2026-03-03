import { Alert, Button, Grid, Group, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconInfoCircle, IconPlus, IconSearch, IconUpload } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { RootState } from '@reducers/index';

import { slotsToArchivedLots } from '../lib/converters';
import { useArchives, useCreateArchive, useImportArchive, useLoadArchive } from '../api/hooks';
import { ArchiveData } from '../model/types';

import ArchiveList from './ArchiveList';
import ImportForm from './ImportForm';
import styles from './ArchiveManagement.module.css';

type SortOption = 'name' | 'createdAt' | 'updatedAt';

const ALERT_DISMISSED_KEY = 'archive-click-to-load-dismissed';

function ArchiveManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [highlightedArchiveId, setHighlightedArchiveId] = useState<string | null>(null);
  const [isImportModalOpened, setIsImportModalOpened] = useState(false);

  const slots = useSelector((state: RootState) => state.slots.slots);
  const { data: archives = [], isLoading } = useArchives();
  const createMutation = useCreateArchive();
  const loadMutation = useLoadArchive();
  const importMutation = useImportArchive();

  const [alertDismissed, setAlertDismissed] = useState(() => {
    return localStorage.getItem(ALERT_DISMISSED_KEY) === 'true';
  });
  const sortByLabelPrefix = `${t('archive.modal.sortBy')}:`;
  const sortOptionLabels = useMemo<Record<SortOption, string>>(
    () => ({
      updatedAt: t('archive.item.updated', { time: '' }).trim(),
      createdAt: t('archive.item.created', { time: '' }).trim(),
      name: t('archive.item.sortByName'),
    }),
    [t],
  );
  const sortSelectData = useMemo(
    () =>
      (Object.keys(sortOptionLabels) as SortOption[]).map((value) => ({
        value,
        label: `${sortByLabelPrefix} ${sortOptionLabels[value]}`,
      })),
    [sortByLabelPrefix, sortOptionLabels],
  );

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

  const handleImport = async (data: ArchiveData, file?: File) => {
    const name =
      file?.name.replace(/\.[^/.]+$/, '').replace(/^pointauc_/g, '') || `Imported ${new Date().toISOString()}`;

    try {
      const importedRecord = await importMutation.mutateAsync({ data, name });
      setHighlightedArchiveId(importedRecord.id);
      setIsImportModalOpened(false);
    } catch {
      // Notification is handled in mutation hook.
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

  return (
    <Stack gap='md'>
      <Grid gutter='xs'>
        <Grid.Col span={8}>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleSaveCurrentAuction}
            loading={createMutation.isPending}
            fullWidth
          >
            {t('archive.modal.saveButton')}
          </Button>
        </Grid.Col>
        <Grid.Col span={4}>
          <Button
            variant='light'
            leftSection={<IconUpload size={16} />}
            onClick={() => setIsImportModalOpened(true)}
            loading={importMutation.isPending}
            fullWidth
          >
            {t('archive.modal.importButton')}
          </Button>
        </Grid.Col>
      </Grid>

      <Group className={styles.searchAndSort}>
        <TextInput
          placeholder={t('archive.modal.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          data={sortSelectData}
          renderOption={({ option }) => sortOptionLabels[option.value as SortOption]}
          aria-label={t('archive.modal.sortBy')}
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          style={{ width: 250 }}
          allowDeselect={false}
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
          highlightedArchiveId={highlightedArchiveId}
        />
      </div>

      <Modal
        opened={isImportModalOpened}
        onClose={() => setIsImportModalOpened(false)}
        title={t('archive.import.title')}
        size='xxl'
      >
        <ImportForm onImport={handleImport} layout='horizontal' />
      </Modal>
    </Stack>
  );
}

export default ArchiveManagement;
