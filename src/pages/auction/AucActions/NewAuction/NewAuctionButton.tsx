import { Alert, Anchor, Button, Group, Modal, SegmentedControl, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconNewSection } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import ROUTES from '@constants/routes.constants';
import { RootState } from '@reducers';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { QUERY_KEYS as archiveQueryKeys } from '@domains/auction/archive/model/constants';
import { auctionHistoryQueryKeys, useNextAuctionHistoryDefaultName } from '@domains/auction/history/api/hooks';
import {
  DEFAULT_AUCTION_REQUESTS_KIND,
  getCurrentAuctionMetadata,
  setCurrentAuctionMetadata,
} from '@domains/auction/history/lib/currentAuctionMetadata';
import { finalizeAuctionHistory } from '@domains/auction/history/lib/finalizeAuctionHistory';

import type { AuctionRequestsKind } from '@domains/auction/history/model/types';

const NewAuctionButton = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);
  const { data: defaultName } = useNextAuctionHistoryDefaultName();
  const [newAuctionName, setNewAuctionName] = useState('');
  const [requestsKind, setRequestsKind] = useState<AuctionRequestsKind>(DEFAULT_AUCTION_REQUESTS_KIND);
  const checkHasOnlyOneEmptyLot = useSelector((state: RootState) => {
    const [lot] = state.slots.slots;

    return (
      state.slots.slots.length === 1 &&
      !lot?.name?.trim() &&
      Number(lot?.amount ?? 0) <= 0 &&
      state.purchases.purchases.length === 0 &&
      state.actionsLog.entries.length === 0 &&
      state.activeAuctionHistory.pendingWinnerEvents.length === 0
    );
  });

  useEffect(() => {
    if (opened) {
      const currentMetadata = getCurrentAuctionMetadata();
      setNewAuctionName(defaultName ?? currentMetadata.name);
      setRequestsKind(DEFAULT_AUCTION_REQUESTS_KIND);
    }
  }, [defaultName, opened]);

  const requestsKindOptions = useMemo(
    () =>
      (['any', 'game', 'movie', 'video'] as const).map((value) => ({
        label: t(`auctionHistory.newAuction.requestsKind.options.${value}`),
        value,
      })),
    [t],
  );

  const handleCreate = async (shouldSave: boolean): Promise<void> => {
    try {
      await finalizeAuctionHistory({ shouldSave });
      setCurrentAuctionMetadata({
        name: newAuctionName,
        requestsKind,
      });
      await archiveApi.clearAutosave();
      await queryClient.invalidateQueries({ queryKey: archiveQueryKeys.archives });
      await queryClient.invalidateQueries({ queryKey: archiveQueryKeys.autosave });
      await queryClient.invalidateQueries({ queryKey: auctionHistoryQueryKeys.all });
      setOpened(false);
      notifications.show({
        color: 'green',
        message: shouldSave
          ? t('auctionHistory.newAuction.notifications.saved')
          : t('auctionHistory.newAuction.notifications.cleared'),
      });
    } catch (err) {
      console.error(err);
      notifications.show({ color: 'red', message: t('auctionHistory.newAuction.notifications.error') });
    }
  };

  return (
    <>
      <Tooltip label={t('auctionHistory.newAuction.action')}>
        <Button
          size='sm'
          fz='md'
          onClick={() => setOpened(true)}
          color='primary'
          aria-label={t('auctionHistory.newAuction.action')}
          leftSection={<IconNewSection />}
        >
          {t('auctionHistory.newAuction.action')}
        </Button>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('auctionHistory.newAuction.title')}
        size='lg'
        centered
        radius='md'
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertTriangle size={18} />} color='blue' variant='light'>
            <Text size='sm'>
              <Trans
                i18nKey='auctionHistory.newAuction.resetAlert'
                components={{
                  historyLink: <Anchor component={Link} to={ROUTES.HISTORY} />,
                }}
              />
            </Text>
          </Alert>
          <TextInput
            label={t('auctionHistory.newAuction.nameLabel')}
            value={newAuctionName}
            onChange={(event) => setNewAuctionName(event.currentTarget.value)}
            size='md'
          />
          <Stack gap={6}>
            <Text size='sm' fw={500}>
              {t('auctionHistory.newAuction.requestsKind.label')}
            </Text>
            <SegmentedControl
              value={requestsKind}
              onChange={(value) => setRequestsKind(value as AuctionRequestsKind)}
              data={requestsKindOptions}
              fullWidth
              size='md'
              aria-label={t('auctionHistory.newAuction.requestsKind.label')}
            />
          </Stack>
          <Group justify='end'>
            {checkHasOnlyOneEmptyLot ? (
              <Button color='primary' onClick={() => handleCreate(false)}>
                {t('auctionHistory.newAuction.startNewAuction')}
              </Button>
            ) : (
              <>
                <Button variant='light' color='gray.8' onClick={() => handleCreate(false)}>
                  {t('auctionHistory.newAuction.createWithoutSaving')}
                </Button>
                <Button color='primary' onClick={() => handleCreate(true)}>
                  {t('auctionHistory.newAuction.createNew')}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default NewAuctionButton;
