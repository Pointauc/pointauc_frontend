import { Button, Card, Group, Modal, SimpleGrid, Stack, Text, Title, Badge } from '@mantine/core';
import { IconAlertTriangle, IconDeviceFloppy, IconCloudDownload } from '@tabler/icons-react';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../lib/formatters';

import type { AuctionSyncConflict, ConflictResolutionChoice } from '../lib/syncService';

interface AuctionHistoryConflictModalProps {
  conflict: AuctionSyncConflict | null;
  opened: boolean;
  onClose: () => void;
}

export const AuctionHistoryConflictModal: FC<AuctionHistoryConflictModalProps> = ({
  conflict,
  opened,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isResolving, setIsResolving] = useState(false);

  if (!conflict) return null;

  const handleResolve = async (choice: ConflictResolutionChoice) => {
    setIsResolving(true);
    try {
      await conflict.resolve(choice);
      onClose();
    } catch (err) {
      console.error('Failed to resolve sync conflict:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const { localAuction, remoteAuction } = conflict;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap='xs'>
          <IconAlertTriangle color='orange' size={24} />
          <Title order={4}>
            {t('auctionHistory.conflict.title', { defaultValue: 'Auction History Sync Conflict' })}
          </Title>
        </Group>
      }
      size='lg'
      centered
    >
      <Stack gap='md'>
        <Text size='sm' c='dimmed'>
          {t(
            'auctionHistory.conflict.description',
            {
              defaultValue:
                'This auction was edited differently on this device compared to the cloud. Choose which version you want to keep.',
            },
          )}
        </Text>

        <SimpleGrid cols={2} spacing='md'>
          {/* Local Version Card */}
          <Card withBorder padding='sm' radius='md'>
            <Stack gap='xs'>
              <Group justify='space-between'>
                <Badge color='blue' variant='light'>
                  {t('auctionHistory.conflict.localBadge', { defaultValue: 'This Device (Local)' })}
                </Badge>
              </Group>
              <Text fw={600} size='sm'>
                {localAuction.name}
              </Text>
              <Text size='xs' c='dimmed'>
                {formatDate(localAuction.startedAt)}
              </Text>
              <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                  {t('auctionHistory.conflict.lots', { defaultValue: 'Lots' })}:
                </Text>
                <Text size='xs' fw={500}>
                  {localAuction.lotCount}
                </Text>
              </Group>
              <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                  {t('auctionHistory.conflict.totalAmount', { defaultValue: 'Total Amount' })}:
                </Text>
                <Text size='xs' fw={600} c='blue'>
                  {localAuction.totalAmount}
                </Text>
              </Group>
              <Button
                mt='xs'
                variant='light'
                color='blue'
                leftSection={<IconDeviceFloppy size={16} />}
                loading={isResolving}
                onClick={() => handleResolve('local')}
              >
                {t('auctionHistory.conflict.keepLocal', { defaultValue: 'Keep Local Version' })}
              </Button>
            </Stack>
          </Card>

          {/* Cloud Version Card */}
          <Card withBorder padding='sm' radius='md'>
            <Stack gap='xs'>
              <Group justify='space-between'>
                <Badge color='teal' variant='light'>
                  {t('auctionHistory.conflict.remoteBadge', { defaultValue: 'Cloud (Server)' })}
                </Badge>
              </Group>
              <Text fw={600} size='sm'>
                {remoteAuction.name}
              </Text>
              <Text size='xs' c='dimmed'>
                {formatDate(remoteAuction.startedAt)}
              </Text>
              <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                  {t('auctionHistory.conflict.lots', { defaultValue: 'Lots' })}:
                </Text>
                <Text size='xs' fw={500}>
                  {remoteAuction.lotCount}
                </Text>
              </Group>
              <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                  {t('auctionHistory.conflict.totalAmount', { defaultValue: 'Total Amount' })}:
                </Text>
                <Text size='xs' fw={600} c='teal'>
                  {remoteAuction.totalAmount}
                </Text>
              </Group>
              <Button
                mt='xs'
                variant='light'
                color='teal'
                leftSection={<IconCloudDownload size={16} />}
                loading={isResolving}
                onClick={() => handleResolve('remote')}
              >
                {t('auctionHistory.conflict.keepRemote', { defaultValue: 'Keep Cloud Version' })}
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};

export default AuctionHistoryConflictModal;
