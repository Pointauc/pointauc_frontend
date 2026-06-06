import { ActionIcon, Badge, Button, Group, Paper, Popover, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArchive, IconCheck, IconDownload, IconPencil, IconRestore, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { RootState } from '@reducers/index';

import { createArchiveData, getArchivePurchases } from '../lib/archiveData';
import { slotsToArchivedLots } from '../lib/converters';
import openPendingBidsDecisionModal from '../lib/openPendingBidsDecisionModal';
import { ArchiveData, ArchiveRecord } from '../model/types';
import { useCreateArchive, useDeleteArchive, useExportArchive, useUpdateArchive } from '../api/hooks';
import { isValidArchiveName } from '../lib/validators';

import styles from './ArchiveItem.module.css';

dayjs.extend(relativeTime);

interface ArchiveItemProps {
  archive: ArchiveRecord;
  archives: ArchiveRecord[];
  onLoad: () => void;
  isLoading?: boolean;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  shouldHighlight?: boolean;
}

const getUniqueRestoredArchiveName = (baseName: string, archives: ArchiveRecord[]): string => {
  const existingNames = new Set(
    archives.filter((archiveRecord) => !archiveRecord.isLastDeleted).map((archiveRecord) => archiveRecord.name),
  );

  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let restoredCount = 1;
  let restoredName = `${baseName} [Restored] #${restoredCount}`;

  while (existingNames.has(restoredName)) {
    restoredCount += 1;
    restoredName = `${baseName} [Restored] #${restoredCount}`;
  }

  return restoredName;
};

function ArchiveItem({
  archive,
  archives,
  onLoad,
  isLoading = false,
  sortBy,
  shouldHighlight = false,
}: ArchiveItemProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(archive.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const [isOverwriteConfirmationOpened, setIsOverwriteConfirmationOpened] = useState(false);
  const [debouncedName] = useDebouncedValue(name, 500);
  const itemRef = useRef<HTMLDivElement | null>(null);

  const slots = useSelector((state: RootState) => state.slots.slots);
  const purchases = useSelector((state: RootState) => state.purchases.purchases);
  const createMutation = useCreateArchive();
  const updateMutation = useUpdateArchive();
  const deleteMutation = useDeleteArchive();
  const exportMutation = useExportArchive();

  const data: ArchiveData = JSON.parse(archive.data);
  const lotCount = data.lots.length;
  const purchaseCount = getArchivePurchases(data).length;
  const isUtilityArchive = archive.isAutosave || archive.isLastDeleted;

  // Update archive name when debounced value changes
  useEffect(() => {
    if (isUtilityArchive) {
      return;
    }

    if (debouncedName !== archive.name && isValidArchiveName(debouncedName)) {
      updateMutation.mutate({ id: archive.id, name: debouncedName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName, isUtilityArchive]);

  // Sync local state if archive name changes externally
  useEffect(() => {
    setName(archive.name);
  }, [archive.name]);

  useEffect(() => {
    if (!shouldHighlight) {
      return;
    }

    itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsHighlightActive(true);

    const timer = window.setTimeout(() => {
      setIsHighlightActive(false);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldHighlight]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUtilityArchive) {
      return;
    }

    deleteMutation.mutate(archive.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportMutation.mutate(archive.id);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!archive.isLastDeleted) {
      return;
    }

    createMutation.mutate({ name: getUniqueRestoredArchiveName(archive.name, archives), data });
  };

  const overwriteArchive = (includePendingBids: boolean) => {
    const archiveData = createArchiveData({
      lots: slotsToArchivedLots(slots),
      purchases,
      isAutosave: false,
      includePurchases: includePendingBids,
    });
    updateMutation.mutate({ id: archive.id, data: archiveData });
  };

  const handleOpenOverwriteConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUtilityArchive) {
      return;
    }

    setIsOverwriteConfirmationOpened(true);
  };

  const handleOverwrite = () => {
    setIsOverwriteConfirmationOpened(false);

    if (purchases.length === 0) {
      overwriteArchive(false);
      return;
    }

    openPendingBidsDecisionModal({
      pendingBidsCount: purchases.length,
      onExclude: () => overwriteArchive(false),
      onInclude: () => overwriteArchive(true),
    });
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
  const archiveName = archive.isAutosave ? t('archive.item.autosave') : archive.name;
  const deleteTooltip = archive.isAutosave
    ? t('archive.item.cannotDelete')
    : archive.isLastDeleted
    ? t('archive.item.cannotDeleteLastDeleted')
    : t('archive.item.delete');

  return (
    <Paper
      ref={itemRef}
      className={`${styles.item} ${isLoading ? styles.loading : ''} ${isHighlightActive ? styles.highlighted : ''}`}
      p='md'
      withBorder
      onClick={onLoad}
    >
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
                  {archiveName}
                </Text>
                {!isUtilityArchive && (
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
            {archive.isLastDeleted && (
              <Tooltip label={t('archive.item.lastDeletedBadgeTooltip')}>
                <Badge color='grape' size='sm'>
                  {t('archive.item.lastDeletedBadge')}
                </Badge>
              </Tooltip>
            )}
          </Group>
        </div>

        <Text size='sm' c='dimmed' className={styles.info}>
          {timeText} • {t('archive.item.lotCount', { count: lotCount })}{' '}
          {purchaseCount > 0 && `• ${t('archive.item.bidCount', { count: purchaseCount })}`}
        </Text>
      </div>

      <Group gap='xs' className={styles.actions}>
        {!isUtilityArchive && (
          <Popover
            opened={isOverwriteConfirmationOpened}
            onChange={setIsOverwriteConfirmationOpened}
            position='bottom'
            withArrow
            shadow='md'
          >
            <Popover.Target>
              <Tooltip label={t('archive.item.overwrite')} disabled={isOverwriteConfirmationOpened}>
                <ActionIcon
                  variant='subtle'
                  size='input-sm'
                  onClick={handleOpenOverwriteConfirmation}
                  loading={updateMutation.isPending}
                >
                  <IconArchive size={20} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown onClick={(e) => e.stopPropagation()} maw={320}>
              <Stack gap='xs'>
                <Text size='sm' fw={600}>
                  {t('archive.item.overwriteConfirmTitle')}
                </Text>
                <Group gap='xs' justify='flex-end'>
                  <Button variant='subtle' size='xs' onClick={() => setIsOverwriteConfirmationOpened(false)}>
                    {t('archive.item.overwriteConfirmCancel')}
                  </Button>
                  <Button color='red' size='xs' onClick={handleOverwrite}>
                    {t('archive.item.overwriteConfirmAction')}
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}

        {archive.isLastDeleted && (
          <Tooltip label={t('archive.item.restore')}>
            <ActionIcon variant='subtle' size='input-sm' onClick={handleRestore} loading={createMutation.isPending}>
              <IconRestore size={20} />
            </ActionIcon>
          </Tooltip>
        )}

        <Tooltip label={t('archive.item.export')}>
          <ActionIcon variant='subtle' size='input-sm' onClick={handleExport} loading={exportMutation.isPending}>
            <IconDownload size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={deleteTooltip}>
          <ActionIcon
            variant='subtle'
            size='input-sm'
            color='red'
            onClick={handleDelete}
            disabled={isUtilityArchive}
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
