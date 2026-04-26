import { Button, Dialog, Group, List, Modal, Stack, Text } from '@mantine/core';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getCurrentLanguage } from '@constants/language.constants';
import { ChangeItem, UpdateData } from '@domains/changelog/model/types';
import { getUpdates } from '@domains/changelog/Updates/helpers.tsx';
import Changelog from '@domains/changelog/ui/Changelog';
import useStorageState from '@hooks/useStorageState.ts';
import { getCookie } from '@utils/common.utils.ts';

const MAX_VISIBLE_BRIEF_UPDATES = 3;

const getBriefItems = (updates: UpdateData[]): ChangeItem[] =>
  updates
    .flatMap((update) => [...(update.newFeatures ?? []), ...(update.improvements ?? []), ...(update.fixes ?? [])])
    .filter((item) => item.briefDescription != null && item.briefDescription !== '');

const ChangelogModal: FC = () => {
  const { t, i18n } = useTranslation();
  const [lastVisit, setLastVisit] = useStorageState<string | null>('lastVisit', getCookie('lastVisit'));
  const [initialLastVisit] = useState<string | null>(lastVisit);
  const currentLanguage = getCurrentLanguage(i18n).key;
  const updates = useMemo(
    () => (initialLastVisit != null ? getUpdates(initialLastVisit, currentLanguage) : []),
    [currentLanguage, initialLastVisit],
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(() => updates.length > 0);

  const briefItems = useMemo(() => getBriefItems(updates), [updates]);
  const latestBriefUpdates = briefItems.slice(0, MAX_VISIBLE_BRIEF_UPDATES);
  const additionalUpdatesCount = Math.max(briefItems.length - MAX_VISIBLE_BRIEF_UPDATES, 0);

  useEffect(() => {
    if (!lastVisit) {
      setLastVisit(new Date().toISOString());
    }
  }, [lastVisit, setLastVisit]);

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false);
    setLastVisit(new Date().toISOString());
  };

  const handleCloseDetails = (): void => {
    setIsDetailsOpen(false);
    setLastVisit(new Date().toISOString());
  };

  const handleOpenDetails = (): void => {
    setIsDialogOpen(false);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Dialog
        opened={isDialogOpen}
        onClose={handleCloseDialog}
        withCloseButton
        position={{ bottom: 24, right: 24 }}
        size={420}
        radius='md'
        withBorder
      >
        <Stack gap='sm'>
          <Text c='primary' fw={700} pr='xl'>
            {t('changelog.dialog.title')}
          </Text>

          <List spacing={4} size='sm' pr='xl'>
            {latestBriefUpdates.map((item, index) => (
              <List.Item key={index}>{item.briefDescription}</List.Item>
            ))}

            {additionalUpdatesCount > 0 && (
              <Text size='sm' c='dimmed' mt='xs'>
                {t('changelog.dialog.moreUpdates', { count: additionalUpdatesCount })}
              </Text>
            )}
          </List>

          <Group justify='flex-end'>
            <Button size='sm' onClick={handleOpenDetails}>
              {t('changelog.dialog.openDetails')}
            </Button>
          </Group>
        </Stack>
      </Dialog>

      <Modal size='lg' opened={isDetailsOpen} onClose={handleCloseDetails} title={t('changelog.modal.title')}>
        <Changelog updates={updates} />
      </Modal>
    </>
  );
};

export default ChangelogModal;
