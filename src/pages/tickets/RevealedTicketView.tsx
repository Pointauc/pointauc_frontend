import { Alert, Box, Button, Card, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { OwnerRevealedTicketResponseDto, RevealedForViewersTicketResponseDto } from '@api/openapi/types.gen';
import { getSlotFromSeed } from '@services/PredictionService';
import ROUTES from '@constants/routes.constants';

import BackendProviderSection from './BackendProviderSection';
import RandomOrgVerificationSection from './RandomOrgVerificationSection';
import WinnerSelectionVisualizer from './WinnerSelectionVisualizer';

interface RevealedTicketViewProps {
  ticket: OwnerRevealedTicketResponseDto | RevealedForViewersTicketResponseDto;
  /** False while the streamer's wheel is still spinning (owner preview only) */
  isPublished: boolean;
}

const formatTimestamp = (timestamp: string) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss');

/**
 * Full ticket result: ticket metadata, provider-specific verification sections,
 * the random number, the winner and the bound participants list.
 */
const RevealedTicketView = ({ ticket, isPublished }: RevealedTicketViewProps) => {
  const { t } = useTranslation();
  const isBackendProvider = ticket.provider === 'backend' || !ticket.verificationMetadata;

  const sortedParticipants = useMemo(() => {
    return [...ticket.participants].sort(
      (a, b) => b.amount - a.amount || (a.name ?? '').localeCompare(b.name ?? ''),
    );
  }, [ticket.participants]);

  const winnerIndex = useMemo(
    () => getSlotFromSeed(sortedParticipants, ticket.randomNumber),
    [sortedParticipants, ticket.randomNumber],
  );

  return (
    <Stack gap='lg' pb='md'>
      <Group justify='space-between' align='center'>
        <Title order={1}>{t('tickets.revealed.title')}</Title>
      </Group>

      {!isPublished && (
        <Alert icon={<IconInfoCircle size={20} />} color='blue' variant='light'>
          {t('tickets.verificationPage.ownerPreviewNote')}
        </Alert>
      )}

      <Button variant='outline' component='a' href={ROUTES.TICKET_VERIFICATION_INFO} target='_blank'>
        {t('tickets.revealed.checkInstruction')}
      </Button>

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Stack gap='sm'>
          <div>
            <Text size='sm' c='dimmed' mb={4}>
              {t('tickets.revealed.ticketId')}
            </Text>
            <Text size='lg' fw={600} ff='monospace'>
              {ticket.ticketId}
            </Text>
          </div>

          <Group grow>
            <div>
              <Text size='sm' c='dimmed' mb={4}>
                {t('tickets.revealed.createdAt')}
              </Text>
              <Text size='sm'>{formatTimestamp(ticket.createdAt)}</Text>
            </div>
            <div>
              <Text size='sm' c='dimmed' mb={4}>
                {t('tickets.revealed.revealedAt')}
              </Text>
              <Text size='sm'>{formatTimestamp(ticket.revealedAt)}</Text>
            </div>
          </Group>
        </Stack>
      </Card>

      {isBackendProvider ? (
        <BackendProviderSection />
      ) : (
        <RandomOrgVerificationSection verificationMetadata={ticket.verificationMetadata!} />
      )}

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Stack gap='sm'>
          <Title order={3}>{t('tickets.revealed.randomNumber')}</Title>
          <Paper bg='dark.8' p='md' radius='md' shadow='none'>
            <Text size='xl' fw={700} ta='center' ff='monospace'>
              {ticket.randomNumber}
            </Text>
          </Paper>
          <Text size='sm' c='dimmed'>
            {isBackendProvider
              ? t('tickets.verificationPage.backendProvider.randomNumberDescription')
              : t('tickets.revealed.randomNumberDescription')}
          </Text>
        </Stack>
      </Card>

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Stack gap='sm'>
          <Title order={3}>{t('tickets.revealed.winner')}</Title>
          <Group>
            <Text size='lg' fw={600}>
              {ticket.metadata.winnerName}
            </Text>
          </Group>
          <Group grow>
            <div>
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.totalLots')}
              </Text>
              <Text size='md' fw={500}>
                {ticket.metadata.lotsCount}
              </Text>
            </div>
            <div>
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.totalAmount')}
              </Text>
              <Text size='md' fw={500}>
                {ticket.metadata.totalAmount}
              </Text>
            </div>
          </Group>

          <Box mt='md'>
            <Text size='sm' fw={500} mb='sm'>
              {t('tickets.revealed.visualRepresentation')}
            </Text>
            <WinnerSelectionVisualizer
              participants={sortedParticipants}
              randomNumber={ticket.randomNumber}
              totalAmount={ticket.metadata.totalAmount}
              winnerIndex={winnerIndex}
            />
          </Box>
        </Stack>
      </Card>

      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Stack gap='sm'>
          <Title order={3}>{t('tickets.revealed.participants')}</Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('tickets.revealed.participantIndex')}</Table.Th>
                <Table.Th>{t('tickets.revealed.participantName')}</Table.Th>
                <Table.Th>{t('tickets.revealed.participantAmount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedParticipants.map((participant, index) => (
                <Table.Tr key={index} bg={winnerIndex === index ? 'primary.7' : undefined}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <Text fw={winnerIndex === index ? 700 : 400}>
                      {participant.name || t('tickets.revealed.anonymousParticipant')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={winnerIndex === index ? 700 : 400}>{participant.amount}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>
    </Stack>
  );
};

export default RevealedTicketView;
