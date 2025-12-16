import { Alert, Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { IconInfoCircle, IconPlus, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { RootState } from '@reducers/index';

import { slotsToArchivedLots } from '../lib/converters';
import { useArchives, useCreateArchive, useLoadArchive } from '../api/hooks';

import ArchiveList from './ArchiveList';
import styles from './ArchiveManagement.module.css';

type SortOption = 'name' | 'createdAt' | 'updatedAt';

const ALERT_DISMISSED_KEY = 'archive-click-to-load-dismissed';

function ArchiveManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');

  const slots = useSelector((state: RootState) => state.slots.slots);
  const { data: archives = [], isLoading } = useArchives();
  const createMutation = useCreateArchive();
  const loadMutation = useLoadArchive();

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
            { value: 'name', label: t('archive.item.sortByName') },
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
  );
}

export default ArchiveManagement;
