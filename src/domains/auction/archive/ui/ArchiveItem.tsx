import { ActionIcon, Badge, Group, Paper, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCheck, IconDownload, IconPencil, IconReplace, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { RootState } from '@reducers/index';

import { slotsToArchivedLots } from '../lib/converters';
import { ArchiveData, ArchiveRecord } from '../model/types';
import { useDeleteArchive, useExportArchive, useUpdateArchive } from '../api/hooks';
import { isValidArchiveName } from '../lib/validators';

import styles from './ArchiveItem.module.css';

dayjs.extend(relativeTime);

interface ArchiveItemProps {
  archive: ArchiveRecord;
  onLoad: () => void;
  isLoading?: boolean;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
}

function ArchiveItem({ archive, onLoad, isLoading = false, sortBy }: ArchiveItemProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(archive.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [debouncedName] = useDebouncedValue(name, 500);

  const slots = useSelector((state: RootState) => state.slots.slots);
  const updateMutation = useUpdateArchive();
  const deleteMutation = useDeleteArchive();
  const exportMutation = useExportArchive();

  const data: ArchiveData = JSON.parse(archive.data);
  const lotCount = data.lots.length;

  // Update archive name when debounced value changes
  useEffect(() => {
    if (debouncedName !== archive.name && isValidArchiveName(debouncedName)) {
      updateMutation.mutate({ id: archive.id, name: debouncedName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  // Sync local state if archive name changes externally
  useEffect(() => {
    setName(archive.name);
  }, [archive.name]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(archive.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportMutation.mutate(archive.id);
  };

  const handleOverwrite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const archiveData = { lots: slotsToArchivedLots(slots) };
    updateMutation.mutate({ id: archive.id, data: archiveData });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleEditName = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleSaveName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isValidArchiveName(name)) {
      setIsEditingName(false);
      if (name !== archive.name) {
        updateMutation.mutate({ id: archive.id, name });
      }
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setName(archive.name);
    setIsEditingName(false);
  };

  // Determine which timestamp to show based on sort option
  const shouldShowUpdated = sortBy === 'updatedAt' || sortBy === 'name';
  const timeText = shouldShowUpdated
    ? t('archive.item.updated', { time: dayjs(archive.updatedAt).fromNow() })
    : t('archive.item.created', { time: dayjs(archive.createdAt).fromNow() });

  return (
    <Paper className={`${styles.item} ${isLoading ? styles.loading : ''}`} p='md' withBorder onClick={onLoad}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Group gap='xs' style={{ flex: 1, minWidth: 0 }}>
            {isEditingName ? (
              <Group gap='xs' style={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  value={name}
                  onChange={handleNameChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={t('archive.item.namePlaceholder')}
                  className={styles.nameInput}
                  size='sm'
                  styles={{
                    input: {
                      fontWeight: 500,
                      padding: '2px 4px',
                      minHeight: 'auto',
                    },
                  }}
                  autoFocus
                />
                <Tooltip label={t('archive.item.saveName')}>
                  <ActionIcon
                    variant='filled'
                    color='green'
                    size='input-sm'
                    onClick={handleSaveName}
                    disabled={!isValidArchiveName(name)}
                  >
                    <IconCheck size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('archive.item.cancelEdit')}>
                  <ActionIcon variant='subtle' color='gray' size='input-sm' onClick={handleCancelEdit}>
                    <IconX size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ) : (
              <>
                <Text fw={500} style={{ wordBreak: 'break-word' }}>
                  {archive.isAutosave ? t('archive.item.autosave') : archive.name}
                </Text>
                {!archive.isAutosave && (
                  <Tooltip label={t('archive.item.editName')}>
                    <ActionIcon variant='subtle' size='input-sm' onClick={handleEditName}>
                      <IconPencil size={20} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </>
            )}
            {archive.isAutosave && (
              <Badge color='blue' size='sm'>
                {t('archive.item.autosaveBadge')}
              </Badge>
            )}
          </Group>
        </div>

        <Text size='sm' c='dimmed' className={styles.info}>
          {timeText} • {t('archive.item.lotCount', { count: lotCount })}
        </Text>
      </div>

      <Group gap='xs' className={styles.actions}>
        {!archive.isAutosave && (
          <Tooltip label={t('archive.item.overwrite')}>
            <ActionIcon variant='subtle' size='input-sm' onClick={handleOverwrite} loading={updateMutation.isPending}>
              <IconReplace size={20} />
            </ActionIcon>
          </Tooltip>
        )}

        <Tooltip label={t('archive.item.export')}>
          <ActionIcon variant='subtle' size='input-sm' onClick={handleExport} loading={exportMutation.isPending}>
            <IconDownload size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={archive.isAutosave ? t('archive.item.cannotDelete') : t('archive.item.delete')}>
          <ActionIcon
            variant='subtle'
            size='input-sm'
            color='red'
            onClick={handleDelete}
            disabled={archive.isAutosave}
            loading={deleteMutation.isPending}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}

export default ArchiveItem;
