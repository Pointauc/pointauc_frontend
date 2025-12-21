import { Alert, Badge, Card, Container, Group, Loader, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { signedRandomControllerGetWinnerRecordByTicketOptions } from '@api/openapi/@tanstack/react-query.gen';
import PageContainer from '@components/PageContainer/PageContainer';

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

  if (isLoading) {
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

  if (error || !record) {
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <PageContainer>
      <Container size='md' py='xl'>
        <Stack gap='lg' pb='md'>
          <Group justify='space-between' align='center'>
            <Title order={1}>{t('tickets.revealed.title')}</Title>
          </Group>

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
                  <Text size='sm'>{formatTimestamp(record.randomData.completionTime)}</Text>
                </div>
                <div>
                  <Text size='sm' c='dimmed' mb={4}>
                    {t('tickets.revealed.revealedAt')}
                  </Text>
                  <Text size='sm'>{formatTimestamp(record.createdAt)}</Text>
                </div>
              </Group>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={3}>{t('tickets.revealed.randomNumber')}</Title>
              <Paper bg='gray' p='md' radius='md'>
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
              <Title order={3}>{t('tickets.revealed.signature')}</Title>
              <Paper bg='gray' p='md' radius='md'>
                <Text size='xs' ff='monospace' style={{ wordBreak: 'break-all' }}>
                  {record.signature}
                </Text>
              </Paper>
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.signatureDescription')}
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
                  {record.participantsJson.map((participant, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Text fw={participant.name === record.metadata.winnerName ? 700 : 400}>
                          {participant.name || t('tickets.revealed.anonymousParticipant')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={participant.name === record.metadata.winnerName ? 700 : 400}>
                          {participant.amount}
                        </Text>
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
