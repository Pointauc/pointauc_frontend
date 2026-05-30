import { Button, Group, Modal, SimpleGrid, Text, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { auctionHistoryQueryKeys, useNextAuctionHistoryDefaultName } from '@domains/auction/history/api/hooks';
import { getActiveAuctionDurationMs } from '@domains/auction/history/lib/activeAuctionState';
import { finalizeAuctionHistory } from '@domains/auction/history/lib/finalizeAuctionHistory';
import { RootState } from '@reducers';

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const NewAuctionButton = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);
  const { data: defaultName } = useNextAuctionHistoryDefaultName();
  const [auctionName, setAuctionName] = useState('');
  const state = useSelector((root: RootState) => root);
  const { slots } = state.slots;
  const processedPurchases = state.purchases.history.filter((purchase) => purchase.status === 'processed');
  const latestWinnerCandidate = [...state.activeAuctionHistory.pendingWinnerEvents]
    .reverse()
    .find(({ status }) => status === 'candidate' || status === 'confirmed');

  const stats = useMemo(() => {
    const activeLots = slots.filter((lot) => Boolean(lot.name) || Number(lot.amount ?? 0) > 0);
    const participants = new Set(processedPurchases.map((purchase) => purchase.investorId || purchase.username));
    const totalAmount = activeLots.reduce((sum, lot) => sum + Number(lot.amount ?? 0), 0);

    return {
      lotCount: activeLots.length,
      bidCount: processedPurchases.length,
      participantCount: participants.size,
      totalAmount,
      duration: getActiveAuctionDurationMs(state),
      winnerName: latestWinnerCandidate
        ? slots.find((lot) => lot.id === latestWinnerCandidate.runtimeLotId)?.name ?? null
        : null,
    };
  }, [latestWinnerCandidate, processedPurchases, slots, state]);

  useEffect(() => {
    if (opened) {
      setAuctionName(defaultName ?? '');
    }
  }, [defaultName, opened]);

  const handleCreate = async (shouldSave: boolean): Promise<void> => {
    try {
      await finalizeAuctionHistory({ name: auctionName, shouldSave });
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
        <Button size='sm' onClick={() => setOpened(true)} variant='outline' color='primary.3'>
          <AddCircleOutlineIcon />
        </Button>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('auctionHistory.newAuction.title')}
        size='lg'
        centered
      >
        <div className='space-y-4'>
          <Text size='sm' c='dimmed'>
            {t('auctionHistory.newAuction.description')}
          </Text>
          <TextInput
            label={t('auctionHistory.newAuction.nameLabel')}
            value={auctionName}
            onChange={(event) => setAuctionName(event.currentTarget.value)}
          />
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <div>
              <Text size='xs' c='dimmed'>
                {t('auctionHistory.metrics.lots')}
              </Text>
              <Text fw={700}>{stats.lotCount}</Text>
            </div>
            <div>
              <Text size='xs' c='dimmed'>
                {t('auctionHistory.metrics.bids')}
              </Text>
              <Text fw={700}>{stats.bidCount}</Text>
            </div>
            <div>
              <Text size='xs' c='dimmed'>
                {t('auctionHistory.metrics.participants')}
              </Text>
              <Text fw={700}>{stats.participantCount}</Text>
            </div>
            <div>
              <Text size='xs' c='dimmed'>
                {t('auctionHistory.metrics.duration')}
              </Text>
              <Text fw={700}>{formatDuration(stats.duration)}</Text>
            </div>
          </SimpleGrid>
          <div className='rounded-md border border-gray-200 p-3'>
            <Text size='xs' c='dimmed'>
              {t('auctionHistory.newAuction.wheelWinner')}
            </Text>
            <Text fw={600}>{stats.winnerName ?? t('auctionHistory.newAuction.noWheelWinner')}</Text>
          </div>
          <Group justify='space-between'>
            <Button variant='subtle' color='red' onClick={() => handleCreate(false)}>
              {t('auctionHistory.newAuction.createWithoutSaving')}
            </Button>
            <Button onClick={() => handleCreate(true)}>{t('auctionHistory.newAuction.createNew')}</Button>
          </Group>
        </div>
      </Modal>
    </>
  );
};

export default NewAuctionButton;
