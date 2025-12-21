import { ActionIcon, Anchor, Card, Divider, Group, Text, Title } from '@mantine/core';
import { IconClock, IconCopy } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

import TextWithHint from '@domains/user-settings/ui/TextWithHint';

import styles from './TicketCard.module.css';

interface TicketCardProps {
  ticketId: string;
  createdAt: string;
  revealedAt?: string;
  randomNumber?: number | null;
  availableQuota?: number | null;
}

// Max daily quota per user
export const MAX_QUOTA = 6;

/**
 * Displays Random.org ticket information with revealed and unrevealed states.
 * Shows ticket ID and creation timestamp always, with placeholders for data
 * that will be revealed after spinning (revealed timestamp and random number).
 */
const TicketCard = ({ ticketId, createdAt, revealedAt, randomNumber, availableQuota }: TicketCardProps) => {
  const { t } = useTranslation();

  const verificationUrl = `${location.origin}/tickets/${ticketId}`;

  return (
    <Card withBorder padding='sm' radius='md' className={styles.card}>
      <Group justify='space-between' align='center'>
        <Title order={5} pb='xs'>
          {t('wheel.ticket.title')}
        </Title>
        {availableQuota != null && (
          <TextWithHint
            hint={t('wheel.ticket.quotaHint', { totalQuota: MAX_QUOTA })}
            textProps={{ size: 'sm', c: availableQuota === 0 ? 'red.3' : 'green.3' }}
          >
            {t('wheel.ticket.quota', {
              quotaLeft: availableQuota,
              totalQuota: MAX_QUOTA,
            })}
          </TextWithHint>
        )}
      </Group>
      <div className={styles.grid}>
        <Text className={styles.label}>{t('wheel.ticket.id')}:</Text>
        <Text className={styles.value}>{ticketId}</Text>

        <Text className={styles.label}>{t('wheel.ticket.createdAt')}:</Text>
        <Text className={styles.value}>{createdAt}</Text>

        <Text className={styles.label}>{t('wheel.ticket.revealedAt')}:</Text>
        {revealedAt ? (
          <Text className={styles.value}>{revealedAt}</Text>
        ) : (
          <div className={styles.pendingIndicator}>
            <IconClock size={12} />
            <Text className={styles.placeholder}>{t('wheel.ticket.waitingForWheelSpinStart')}</Text>
          </div>
        )}

        <Text className={styles.label}>{t('wheel.ticket.randomNumber')}:</Text>
        {randomNumber ? (
          <Text className={styles.value}>{randomNumber}</Text>
        ) : (
          <div className={styles.pendingIndicator}>
            <IconClock size={12} />
            <Text className={styles.placeholder}>{t('wheel.ticket.waitingForWheelSpinEnd')}</Text>
          </div>
        )}
      </div>

      <Divider my='xs' />

      <Group justify='space-between' align='center'>
        <Text size='sm' c='dimmed'>
          <Trans
            i18nKey='wheel.ticket.verifyAt'
            values={{ url: verificationUrl.replace(/http(s)?:\/\//, '') }}
            components={{ 1: <Anchor href={verificationUrl} target='_blank' /> }}
          />
        </Text>
        <ActionIcon
          variant='default'
          size='sm'
          onClick={() => {
            navigator.clipboard.writeText(verificationUrl);
            notifications.show({
              message: t('common.linkCopied'),
              color: 'green',
            });
          }}
          title={t('common.copy')}
        >
          <IconCopy size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export default TicketCard;
