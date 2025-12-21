import {
  Alert,
  Badge,
  Box,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Anchor,
  Button,
} from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { IconAlertCircle, IconCheck, IconExternalLink } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useMemo } from 'react';

import { signedRandomControllerGetWinnerRecordByTicketOptions } from '@api/openapi/@tanstack/react-query.gen';
import PageContainer from '@components/PageContainer/PageContainer';
import { getWinnerFromDistance } from '@domains/winner-selection/wheel-of-random/lib/geometry';
import { getSlotFromSeed } from '@services/PredictionService';

import WinnerSelectionVisualizer from './WinnerSelectionVisualizer';

interface RandomOrgTicketResponse {
  jsonrpc: string;
  id: number;
  result: {
    ticketId: string;
    creationTime: string;
    usedTime: string | null;
    result: {
      random: {
        data: number[];
        completionTime: string;
        [key: string]: unknown;
      };
    };
  };
}

const RevealedTicketPage = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();

  const {
    data: record,
    isLoading,
    error,
  } = useQuery(
    signedRandomControllerGetWinnerRecordByTicketOptions({
      path: { ticketId: ticketId! },
    }),
  );

  const randomOrgTicketQuery = useQuery({
    queryKey: ['random-org-ticket', ticketId],
    queryFn: () =>
      axios
        .post<RandomOrgTicketResponse>('https://api.random.org/json-rpc/4/invoke', {
          jsonrpc: '2.0',
          method: 'getTicket',
          params: {
            ticketId: ticketId,
          },
          id: Math.floor(Math.random() * 10000),
        })
        .then((res) => res.data),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 60,
  });

  const sortedParticipants = useMemo(() => {
    return record?.participantsJson.sort((a, b) => b.amount - a.amount || (a.name ?? '').localeCompare(b.name ?? ''));
  }, [record?.participantsJson]);

  if (isLoading || randomOrgTicketQuery.isLoading) {
    return (
      <PageContainer>
        <Container size='md' py='xl'>
          <Stack align='center' gap='md'>
            <Loader size='lg' />
            <Text c='dimmed'>{t('tickets.revealed.loading')}</Text>
          </Stack>
        </Container>
      </PageContainer>
    );
  }

  if (error || !record || randomOrgTicketQuery.error || !randomOrgTicketQuery.data) {
    return (
      <PageContainer>
        <Container size='md' py='xl'>
          <Alert icon={<IconAlertCircle size={20} />} title={t('tickets.revealed.error.title')} color='red'>
            {t('tickets.revealed.error.message')}
          </Alert>
        </Container>
      </PageContainer>
    );
  }

  const randomOrgData = randomOrgTicketQuery.data.result;

  const formatTimestamp = (timestamp: string) => {
    return `${timestamp} (UTC)`;
  };

  const winnerIndex = getSlotFromSeed(record.participantsJson, randomOrgData.result.random.data[0]);

  return (
    <PageContainer>
      <Container size='md' py='xl'>
        <Stack gap='lg' pb='md'>
          <Group justify='space-between' align='center'>
            <Title order={1}>{t('tickets.revealed.title')}</Title>
          </Group>
          <Button variant='outline' component='a' href='/tickets/verification-instructions' target='_blank'>
            {t('tickets.revealed.checkInstruction')}
          </Button>

          <Alert color='orange' icon={<IconAlertCircle size={20} />} variant='light'>
            {t('tickets.revealed.warning')}
          </Alert>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <div>
                <Text size='sm' c='dimmed' mb={4}>
                  {t('tickets.revealed.ticketId')}
                </Text>
                <Text size='lg' fw={600} ff='monospace'>
                  {record.ticketId}
                </Text>
              </div>

              <Group grow>
                <div>
                  <Text size='sm' c='dimmed' mb={4}>
                    {t('tickets.revealed.createdAt')}
                  </Text>
                  <Text size='sm'>{formatTimestamp(randomOrgData.creationTime)}</Text>
                </div>
                <div>
                  <Text size='sm' c='dimmed' mb={4}>
                    {t('tickets.revealed.usedTime')}
                  </Text>
                  <Text size='sm'>{randomOrgData.usedTime ? formatTimestamp(randomOrgData.usedTime) : '-'}</Text>
                </div>
              </Group>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={3}>{t('tickets.revealed.signature')}</Title>
              <CodeHighlight
                code={record.signature ?? ''}
                language='text'
                withCopyButton
                copyLabel={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
              <Group justify='space-between' align='center'>
                <Text size='sm' c='dimmed'>
                  {t('tickets.revealed.signatureDescription')}
                </Text>
                <Button
                  component='a'
                  href='https://api.random.org/signatures/form'
                  target='_blank'
                  rel='noopener noreferrer'
                  variant='light'
                  size='sm'
                  rightSection={<IconExternalLink size={16} />}
                >
                  {t('tickets.revealed.verifySignature')}
                </Button>
              </Group>

              <Title order={4} mt='md'>
                {t('tickets.revealed.randomData')}
              </Title>
              <CodeHighlight
                code={JSON.stringify(randomOrgData.result.random ?? {}, null, 2)}
                language='json'
                withCopyButton
                copyLabel={t('common.copy')}
                copiedLabel={t('common.copied')}
                style={{ maxHeight: '200px', overflow: 'auto' }}
              />
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.randomDataDescription')}
              </Text>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={3}>{t('tickets.revealed.randomNumber')}</Title>
              <Paper bg='dark.8' p='md' radius='md' shadow='none'>
                <Text size='xl' fw={700} ta='center' ff='monospace'>
                  {record.randomData.data[0]}
                </Text>
              </Paper>
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.randomNumberDescription')}
              </Text>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={3}>{t('tickets.revealed.winner')}</Title>
              <Group>
                <Text size='lg' fw={600}>
                  {record.metadata.winnerName}
                </Text>
              </Group>
              <Group grow>
                <div>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.revealed.totalLots')}
                  </Text>
                  <Text size='md' fw={500}>
                    {record.metadata.lotsCount}
                  </Text>
                </div>
                <div>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.revealed.totalAmount')}
                  </Text>
                  <Text size='md' fw={500}>
                    {record.metadata.totalAmount}
                  </Text>
                </div>
              </Group>

              <Box mt='md'>
                <Text size='sm' fw={500} mb='sm'>
                  {t('tickets.revealed.visualRepresentation')}
                </Text>
                <WinnerSelectionVisualizer
                  participants={sortedParticipants || []}
                  randomNumber={record.randomData.data[0]}
                  totalAmount={record.metadata.totalAmount}
                  winnerIndex={winnerIndex}
                />
              </Box>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={3}>{t('tickets.revealed.participants')}</Title>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('tickets.revealed.participantName')}</Table.Th>
                    <Table.Th>{t('tickets.revealed.participantAmount')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedParticipants?.map((participant, index) => (
                    <Table.Tr key={index} bg={winnerIndex === index ? 'primary.7' : undefined}>
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
      </Container>
    </PageContainer>
  );
};

export default RevealedTicketPage;
