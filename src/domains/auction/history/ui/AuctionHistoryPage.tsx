import {
  Badge,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import { useAuctionHistoryAuctions, useAuctionHistoryDetails, useAuctionHistoryParticipants } from '../api/hooks';
import { AUCTION_HISTORY_PAGE_SIZE } from '../model/constants';
import {
  calculateWeightedDonationPoints,
  calculateWeightedTotalPoints,
  formatAuctionCurrencyMode,
  getAuctionCurrencyMode,
  getAuctionDayKey,
  getAuctionWeekday,
} from '../lib/derived';

import type { AuctionHistoryAuction, AuctionHistoryLot } from '../model/types';

const toDateInput = (date: Date): string => date.toISOString().slice(0, 10);
const fromDateInput = (value: string, endOfDay = false): string =>
  `${value}${endOfDay ? 'T23:59:59.999' : 'T00:00:00.000'}`;

const formatMoney = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const formatDate = (value: string): string => new Date(value).toLocaleDateString();
const formatDuration = (durationMs: number): string => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const getPreviousDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const AuctionCard = ({
  auction,
  onSelect,
}: {
  auction: AuctionHistoryAuction;
  onSelect: (auctionId: string) => void;
}) => {
  const { t } = useTranslation();
  const currencyMode = getAuctionCurrencyMode(auction);

  return (
    <Paper withBorder radius='sm' p='md' className='space-y-3'>
      <Group justify='space-between' align='flex-start'>
        <div>
          <Title order={3} size='h4'>
            {auction.name}
          </Title>
          <Text size='sm' c='dimmed'>
            {formatDate(auction.startedAt)} - {formatDuration(auction.durationMs)}
          </Text>
        </div>
        <Badge variant='light'>{t(`auctionHistory.selectionMethod.${auction.selectionMethod}`)}</Badge>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 5 }}>
        <Stat label={t('auctionHistory.metrics.lots')} value={auction.lotCount} />
        <Stat label={t('auctionHistory.metrics.participants')} value={auction.participantCount} />
        <Stat label={t('auctionHistory.metrics.points')} value={auction.totalPoints.toLocaleString()} />
        <Stat label={t('auctionHistory.metrics.donations')} value={formatMoney(auction.totalDonationCents)} />
        <Stat label={t('auctionHistory.metrics.currency')} value={formatAuctionCurrencyMode(currencyMode, t)} />
      </SimpleGrid>
      <Group justify='flex-end'>
        <Button variant='light' onClick={() => onSelect(auction.id)}>
          {t('auctionHistory.actions.openAuction')}
        </Button>
      </Group>
    </Paper>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <Text size='xs' c='dimmed'>
      {label}
    </Text>
    <Text fw={700}>{value}</Text>
  </div>
);

const AuctionDetails = ({ auctionId, onBack }: { auctionId: string; onBack: () => void }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useAuctionHistoryDetails(auctionId);
  const { data: participants = [] } = useAuctionHistoryParticipants();
  const participantById = useMemo(() => new Map(participants.map((participant) => [participant.id, participant])), [participants]);

  if (isLoading || !data) {
    return <Loader />;
  }

  const confirmedWinner = [...data.winnerEvents].reverse().find(({ status }) => status === 'confirmed');
  const winnerLot = confirmedWinner ? data.lots.find((lot) => lot.id === confirmedWinner.lotId) : null;
  const lots = [...data.lots].sort((first, second) => second.totalAmount - first.totalAmount);

  return (
    <Stack>
      <Group justify='space-between'>
        <div>
          <Title order={2}>{data.auction.name}</Title>
          <Text c='dimmed'>{formatDate(data.auction.startedAt)}</Text>
        </div>
        <Button variant='subtle' onClick={onBack}>
          {t('auctionHistory.actions.backToList')}
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 2, md: 5 }}>
        <Stat label={t('auctionHistory.metrics.lots')} value={data.auction.lotCount} />
        <Stat label={t('auctionHistory.metrics.participants')} value={data.auction.participantCount} />
        <Stat label={t('auctionHistory.metrics.points')} value={data.auction.totalPoints.toLocaleString()} />
        <Stat label={t('auctionHistory.metrics.donations')} value={formatMoney(data.auction.totalDonationCents)} />
        <Stat label={t('auctionHistory.metrics.winner')} value={winnerLot?.name ?? t('auctionHistory.empty.noWinner')} />
      </SimpleGrid>
      <Paper withBorder radius='sm' p='md'>
        <Title order={3} size='h4' mb='sm'>
          {t('auctionHistory.sections.requestLots')}
        </Title>
        <Table.ScrollContainer minWidth={620}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('auctionHistory.metrics.lot')}</Table.Th>
                <Table.Th>{t('auctionHistory.metrics.totalAmount')}</Table.Th>
                <Table.Th>{t('auctionHistory.metrics.points')}</Table.Th>
                <Table.Th>{t('auctionHistory.metrics.donations')}</Table.Th>
                <Table.Th>{t('auctionHistory.metrics.contributors')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lots.map((lot) => {
                const lotContributions = data.contributions.filter((contribution) => contribution.lotId === lot.id);
                const contributorNames = lotContributions
                  .map((contribution) => participantById.get(contribution.participantId)?.displayName)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <Table.Tr key={lot.id}>
                    <Table.Td>{lot.name || t('auctionHistory.empty.unnamedLot')}</Table.Td>
                    <Table.Td>{lot.totalAmount.toLocaleString()}</Table.Td>
                    <Table.Td>{lot.totalPoints.toLocaleString()}</Table.Td>
                    <Table.Td>{formatMoney(lot.totalDonationCents)}</Table.Td>
                    <Table.Td>{contributorNames || '-'}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Stack>
  );
};

const AuctionHistoryPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(toDateInput(getPreviousDate(90)));
  const [endDate, setEndDate] = useState(toDateInput(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const startAt = fromDateInput(startDate);
  const endAt = fromDateInput(endDate, true);
  const { data: auctions = [], isLoading } = useAuctionHistoryAuctions(startAt, endAt);
  const { data: participants = [] } = useAuctionHistoryParticipants();

  const filteredAuctions = selectedDay
    ? auctions.filter((auction) => getAuctionDayKey(auction) === selectedDay)
    : auctions;
  const totalPages = Math.max(1, Math.ceil(filteredAuctions.length / AUCTION_HISTORY_PAGE_SIZE));
  const visibleAuctions = filteredAuctions.slice((page - 1) * AUCTION_HISTORY_PAGE_SIZE, page * AUCTION_HISTORY_PAGE_SIZE);
  const weightedTotal = auctions.reduce(
    (sum, auction) =>
      sum + calculateWeightedTotalPoints(auction.totalPoints, auction.totalDonationCents, auction.pointsToDonationRatio),
    0,
  );
  const weightedDonations = auctions.reduce(
    (sum, auction) => sum + calculateWeightedDonationPoints(auction.totalDonationCents, auction.pointsToDonationRatio),
    0,
  );
  const heatmapDays = useMemo(() => {
    const grouped = new Map<string, AuctionHistoryAuction[]>();
    auctions.forEach((auction) => {
      const dayKey = getAuctionDayKey(auction);
      grouped.set(dayKey, [...(grouped.get(dayKey) ?? []), auction]);
    });

    return Array.from(grouped.entries()).sort(([first], [second]) => first.localeCompare(second));
  }, [auctions]);
  const maxDayWeight = Math.max(
    1,
    ...heatmapDays.map(([, dayAuctions]) =>
      dayAuctions.reduce(
        (sum, auction) =>
          sum + calculateWeightedTotalPoints(auction.totalPoints, auction.totalDonationCents, auction.pointsToDonationRatio),
        0,
      ),
    ),
  );
  const weekdayCounts = auctions.reduce<number[]>((counts, auction) => {
    counts[getAuctionWeekday(auction)] += 1;
    return counts;
  }, [0, 0, 0, 0, 0, 0, 0]);
  const topParticipants = [...participants]
    .sort((first, second) => second.totalPoints + second.totalDonationCents - (first.totalPoints + first.totalDonationCents))
    .slice(0, 5);

  return (
    <PageContainer title={t('auctionHistory.page.title')}>
      <Stack gap='lg'>
        <Text c='dimmed'>{t('auctionHistory.page.subtitle')}</Text>
        <Group>
          <TextInput type='date' label={t('auctionHistory.filters.startDate')} value={startDate} onChange={(event) => setStartDate(event.currentTarget.value)} />
          <TextInput type='date' label={t('auctionHistory.filters.endDate')} value={endDate} onChange={(event) => setEndDate(event.currentTarget.value)} />
          {selectedDay && (
            <Button variant='light' onClick={() => setSelectedDay(null)}>
              {t('auctionHistory.actions.clearDayFilter')}
            </Button>
          )}
        </Group>
        {isLoading ? (
          <Loader />
        ) : (
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]'>
            <Stack>
              <SimpleGrid cols={{ base: 2, md: 5 }}>
                <Paper withBorder radius='sm' p='md'>
                  <Stat label={t('auctionHistory.metrics.auctions')} value={auctions.length} />
                </Paper>
                <Paper withBorder radius='sm' p='md'>
                  <Stat label={t('auctionHistory.metrics.participants')} value={participants.length} />
                </Paper>
                <Paper withBorder radius='sm' p='md'>
                  <Stat label={t('auctionHistory.metrics.points')} value={auctions.reduce((sum, auction) => sum + auction.totalPoints, 0).toLocaleString()} />
                </Paper>
                <Paper withBorder radius='sm' p='md'>
                  <Stat label={t('auctionHistory.metrics.donations')} value={formatMoney(auctions.reduce((sum, auction) => sum + auction.totalDonationCents, 0))} />
                </Paper>
                <Paper withBorder radius='sm' p='md'>
                  <Stat label={t('auctionHistory.metrics.weightedTotal')} value={Math.round(weightedTotal).toLocaleString()} />
                </Paper>
              </SimpleGrid>
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]'>
                <Paper withBorder radius='sm' p='md'>
                  <Title order={3} size='h4' mb='sm'>
                    {t('auctionHistory.sections.activityHeatmap')}
                  </Title>
                  <Group gap={6}>
                    {heatmapDays.map(([dayKey, dayAuctions]) => {
                      const weight = dayAuctions.reduce(
                        (sum, auction) =>
                          sum +
                          calculateWeightedTotalPoints(
                            auction.totalPoints,
                            auction.totalDonationCents,
                            auction.pointsToDonationRatio,
                          ),
                        0,
                      );
                      const opacity = 0.2 + (weight / maxDayWeight) * 0.8;

                      return (
                        <button
                          type='button'
                          key={dayKey}
                          className='h-8 min-w-20 rounded border border-emerald-800 px-2 text-xs text-white'
                          style={{ backgroundColor: `rgba(5, 150, 105, ${opacity})` }}
                          onClick={() => {
                            setSelectedDay(dayKey);
                            setPage(1);
                          }}
                        >
                          {dayKey.slice(5)}
                        </button>
                      );
                    })}
                  </Group>
                </Paper>
                <Paper withBorder radius='sm' p='md'>
                  <Title order={3} size='h4' mb='sm'>
                    {t('auctionHistory.sections.weekdayActivity')}
                  </Title>
                  <Stack gap='xs'>
                    {weekdayCounts.map((count, index) => (
                      <div key={weekdayKeys[index]}>
                        <Group justify='space-between'>
                          <Text size='xs'>{t(`auctionHistory.weekdays.${weekdayKeys[index]}`)}</Text>
                          <Text size='xs'>{auctions.length ? Math.round((count / auctions.length) * 100) : 0}%</Text>
                        </Group>
                        <Progress value={auctions.length ? (count / auctions.length) * 100 : 0} />
                      </div>
                    ))}
                  </Stack>
                </Paper>
              </div>
              {selectedAuctionId ? (
                <AuctionDetails auctionId={selectedAuctionId} onBack={() => setSelectedAuctionId(null)} />
              ) : (
                <Stack>
                  <Title order={2}>{t('auctionHistory.sections.previousAuctions')}</Title>
                  {visibleAuctions.length === 0 ? (
                    <Paper withBorder radius='sm' p='xl'>
                      <Text c='dimmed'>{t('auctionHistory.empty.noAuctions')}</Text>
                    </Paper>
                  ) : (
                    visibleAuctions.map((auction) => (
                      <AuctionCard key={auction.id} auction={auction} onSelect={setSelectedAuctionId} />
                    ))
                  )}
                  <Pagination total={totalPages} value={page} onChange={setPage} />
                </Stack>
              )}
            </Stack>
            <Stack>
              <Paper withBorder radius='sm' p='md'>
                <Title order={3} size='h4' mb='sm'>
                  {t('auctionHistory.sections.topParticipants')}
                </Title>
                <Stack gap='sm'>
                  {topParticipants.map((participant, index) => (
                    <Group key={participant.id} justify='space-between'>
                      <Text fw={index < 3 ? 700 : 500}>{participant.displayName}</Text>
                      <Text size='sm' c='dimmed'>
                        {participant.bidCount} {t('auctionHistory.metrics.bids').toLowerCase()}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
              <Paper withBorder radius='sm' p='md'>
                <Title order={3} size='h4' mb='sm'>
                  {t('auctionHistory.sections.pointsVsDonations')}
                </Title>
                <Progress.Root size='xl'>
                  <Progress.Section value={weightedTotal ? ((weightedTotal - weightedDonations) / weightedTotal) * 100 : 0} color='violet'>
                    <Progress.Label>{t('auctionHistory.metrics.points')}</Progress.Label>
                  </Progress.Section>
                  <Progress.Section value={weightedTotal ? (weightedDonations / weightedTotal) * 100 : 0} color='green'>
                    <Progress.Label>{t('auctionHistory.metrics.donations')}</Progress.Label>
                  </Progress.Section>
                </Progress.Root>
              </Paper>
            </Stack>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
};

export default AuctionHistoryPage;
