import { ActionIcon, Anchor, Card, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { IconClock, IconCopy } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

import styles from './TicketCard.module.css';

interface TicketCardProps {
  ticketId: string;
  createdAt: string;
  revealedAt?: string | null;
  randomNumber?: number | null;
}

const QR_CODE_SIZE = 92;

const formatTimestamp = (timestamp: string) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss');

/**
 * Compact viewer verification ticket card.
 * Shows the ticket creation time and the public verification link with a QR code;
 * the reveal time and the random number appear once the spin is done.
 */
const TicketCard = ({ ticketId, createdAt, revealedAt, randomNumber }: TicketCardProps) => {
  const { t } = useTranslation();

  const verificationUrl = `${location.origin}/verify/${ticketId}`;

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    notifications.show({
      message: t('common.linkCopied'),
      color: 'green',
    });
  };

  return (
    <Card withBorder padding='sm' radius='md' className={styles.card}>
      <Stack gap={0}>
        <Group gap='md' align='flex-start' wrap='nowrap'>
          <div className={styles.qrWrapper}>
            <QRCodeSVG value={verificationUrl} size={QR_CODE_SIZE} />
          </div>
          <Stack gap={0} miw={0} style={{ flex: 1 }}>
            <Title order={5} pb='xs'>
              {t('wheel.ticket.title')}
            </Title>
            <Group gap='xxs' align='center' wrap='nowrap'>
              <Text className={styles.label}>{t('wheel.ticket.createdAt')}:</Text>
              <Text className={styles.value}>{formatTimestamp(createdAt)}</Text>
            </Group>
            <Group gap='xxs' align='center' wrap='nowrap'>
              <Text className={styles.label}>{t('wheel.ticket.revealedAt')}:</Text>
              {revealedAt ? (
                <Text className={styles.value}>{formatTimestamp(revealedAt)}</Text>
              ) : (
                <div className={styles.pendingIndicator}>
                  <IconClock size={12} />
                  <Text className={styles.placeholder}>{t('wheel.ticket.waitingForWheelSpinStart')}</Text>
                </div>
              )}
            </Group>
            <Group gap='xxs' align='center' wrap='nowrap'>
              <Text className={styles.label}>{t('wheel.ticket.randomNumber')}:</Text>
              {randomNumber != null ? (
                <Text className={styles.value}>{randomNumber}</Text>
              ) : (
                <div className={styles.pendingIndicator}>
                  <IconClock size={12} />
                  <Text className={styles.placeholder}>{t('wheel.ticket.waitingForWheelSpinEnd')}</Text>
                </div>
              )}
            </Group>
          </Stack>
        </Group>

        <Divider my='xs' />

        <Group justify='space-between' gap='xs' wrap='nowrap'>
          <Text className={styles.label}>{t('wheel.ticket.verifyAt')}:</Text>
          <ActionIcon
            variant='default'
            size='sm'
            onClick={copyVerificationLink}
            title={t('common.copy')}
            style={{ flexShrink: 0 }}
          >
            <IconCopy size={14} />
          </ActionIcon>
        </Group>
        <Anchor href={verificationUrl} target='_blank' size='sm' className={styles.link}>
          {verificationUrl.replace(/^https?:\/\//, '')}
        </Anchor>
      </Stack>
    </Card>
  );
};

export default TicketCard;
