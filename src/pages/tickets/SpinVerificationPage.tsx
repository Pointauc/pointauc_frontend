import { Alert, Container, Loader, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { ticketsControllerGetTicketByTicketIdOptions } from '@api/openapi/@tanstack/react-query.gen';
import {
  OwnerRevealedTicketResponseDto,
  RevealedForViewersTicketResponseDto,
  TicketsControllerGetTicketByTicketIdResponses,
} from '@api/openapi/types.gen';
import PageContainer from '@components/PageContainer/PageContainer';

import RevealedTicketView from './RevealedTicketView';
import TicketStatusCard from './TicketStatusCard';

type TicketResponse = TicketsControllerGetTicketByTicketIdResponses[200];
type FullTicketResponse = OwnerRevealedTicketResponseDto | RevealedForViewersTicketResponseDto;

/** Poll the ticket until it is revealed and published for viewers */
const TICKET_POLL_INTERVAL_MS = 5000;

/**
 * Public spin verification page. Opened from a link shared by the streamer,
 * it can be opened before the spin starts and polls the ticket so viewers
 * see the reveal update live.
 */
const SpinVerificationPage = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();

  const ticketQuery = useQuery({
    ...ticketsControllerGetTicketByTicketIdOptions({ path: { ticketId: ticketId! } }),
    enabled: !!ticketId,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (data && data.revealed && data.isRevealedForViewers) {
        return false;
      }

      return TICKET_POLL_INTERVAL_MS;
    },
  });

  const renderError = () => (
    <PageContainer>
      <Container size='md' py='xl'>
        <Alert icon={<IconAlertCircle size={20} />} title={t('tickets.revealed.error.title')} color='red'>
          {t('tickets.revealed.error.message')}
        </Alert>
      </Container>
    </PageContainer>
  );

  if (!ticketId) {
    return renderError();
  }

  if (ticketQuery.isLoading) {
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

  const data = ticketQuery.data;

  if (ticketQuery.isError || !data) {
    return renderError();
  }

  if (!('revealedAt' in data)) {
    // Waiting: the ticket exists but nothing has happened yet
    return (
      <PageContainer>
        <Container size='md' py='xl' w='100%'>
          <TicketStatusCard ticketId={data.ticketId} createdAt={data.createdAt} isInProgress={false} />
        </Container>
      </PageContainer>
    );
  }

  if (!('randomNumber' in data)) {
    // Spin in progress: anonymous visitors get only minimal data until the wheel stops
    return (
      <PageContainer>
        <Container size='md' py='xl' w='100%'>
          <TicketStatusCard
            ticketId={data.ticketId}
            createdAt={data.createdAt}
            revealedAt={data.revealedAt}
            isInProgress={true}
          />
        </Container>
      </PageContainer>
    );
  }

  // Published for viewers, or an owner previewing their own in-progress spin
  return (
    <PageContainer>
      <Container size='md' pb='xl' w='100%'>
        <RevealedTicketView ticket={data} isPublished={data.isRevealedForViewers} />
      </Container>
    </PageContainer>
  );
};

export default SpinVerificationPage;
