import { Alert, Loader, Stack, Text } from '@mantine/core';
import { IconArchive, IconInfoCircle } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArchiveRecord } from '../model/types';

import ArchiveItem from './ArchiveItem';
import styles from './ArchiveList.module.css';

interface ArchiveListProps {
  archives: ArchiveRecord[];
  onLoadArchive: (id: string) => void;
  loadingArchiveId?: string;
  isLoading?: boolean;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
}

function ArchiveList({ archives, onLoadArchive, loadingArchiveId, isLoading, sortBy }: ArchiveListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size='lg' />
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className={styles.emptyState}>
        <IconArchive className={styles.emptyIcon} size={64} stroke={1.5} />
        <Text size='lg' fw={500}>
          {t('archive.modal.emptyState')}
        </Text>
      </div>
    );
  }

  return (
    <Stack gap='sm' className={styles.list}>
      <AnimatePresence initial={false} mode='popLayout'>
        {archives.map((archive) => (
          <motion.div
            key={archive.id}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            layout
          >
            <ArchiveItem
              archive={archive}
              onLoad={() => onLoadArchive(archive.id)}
              isLoading={loadingArchiveId === archive.id}
              sortBy={sortBy}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  );
}

export default ArchiveList;
