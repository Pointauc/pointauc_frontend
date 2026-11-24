import { Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface TicketStatusCardProps {
  ticketId: string;
  createdAt: string;
  revealedAt?: string;
  /** True when the wheel is currently spinning (ticket revealed but not published yet) */
  isInProgress: boolean;
}

const formatTimestamp = (timestamp: string) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss');

/**
 * Minimal ticket status card shown when there is no result to display yet:
 * the ticket was created and is waiting for the streamer to start the spin,
 * or the spin is in progress and the result will appear automatically.
 */
const TicketStatusCard = ({ ticketId, createdAt, revealedAt, isInProgress }: TicketStatusCardProps) => {
  const { t } = useTranslation();

  return (
    <Card shadow='sm' padding='lg' radius='md' withBorder>
      <Stack gap='sm'>
        <Group gap='xs' align='center'>
          <IconClockHour4 size={22} />
          <Title order={3}>
            {isInProgress ? t('tickets.verificationPage.inProgress.title') : t('tickets.verificationPage.waiting.title')}
          </Title>
        </Group>

        <Text size='sm'>
          {isInProgress
            ? t('tickets.verificationPage.inProgress.message')
            : t('tickets.verificationPage.waiting.message')}
        </Text>

        <Stack gap='xs' mt='xs'>
          <div>
            <Text size='sm' c='dimmed' mb={4}>
              {t('tickets.revealed.ticketId')}
            </Text>
            <Text size='lg' fw={600} ff='monospace'>
              {ticketId}
            </Text>
          </div>
          <div>
            <Text size='sm' c='dimmed' mb={4}>
              {t('tickets.revealed.createdAt')}
            </Text>
            <Text size='sm'>{formatTimestamp(createdAt)}</Text>
          </div>
          {revealedAt && (
            <div>
              <Text size='sm' c='dimmed' mb={4}>
                {t('tickets.revealed.revealedAt')}
              </Text>
              <Text size='sm'>{formatTimestamp(revealedAt)}</Text>
            </div>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default TicketStatusCard;
