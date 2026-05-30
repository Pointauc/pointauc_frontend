import { Avatar, Badge, Button, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import {
  IconArrowLeft,
  IconCards,
  IconClock,
  IconDice5,
  IconHeart,
  IconTargetArrow,
  IconTicket,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatCompactNumber, formatDate, formatDuration, formatMoney } from '../lib/formatters';
import {
  createParticipantNameResolver,
  getAuctionWeightedTotal,
  getContributionWeightedTotal,
  getEffectiveWinnerLot,
} from '../lib/statistics';

import AuctionMetricCard from './AuctionMetricCard';

import type { AuctionHistoryDetails } from '../api/AuctionHistoryApi';
import type { AuctionHistoryParticipant } from '../model/types';

interface SelectedAuctionViewProps {
  details: AuctionHistoryDetails;
  participants: AuctionHistoryParticipant[];
  onBack: () => void;
}

const groupBy = <TValue, TKey extends string>(
  values: TValue[],
  getKey: (value: TValue) => TKey,
): Map<TKey, TValue[]> => {
  const grouped = new Map<TKey, TValue[]>();

  values.forEach((value) => {
    const key = getKey(value);
    const group = grouped.get(key);
    if (group) {
      group.push(value);
      return;
    }

    grouped.set(key, [value]);
  });

  return grouped;
};

const SelectedAuctionView = ({ details, participants, onBack }: SelectedAuctionViewProps) => {
  const { t } = useTranslation();
  const resolveParticipantName = useMemo(() => createParticipantNameResolver(participants), [participants]);
  const winnerLot = getEffectiveWinnerLot(details.lots, details.winnerEvents);

  const lotRows = useMemo(() => {
    // A selected auction can contain ~1000 contributions, so group them once and reuse
    // the grouped shape while rendering every request lot row.
    const contributionsByLotId = groupBy(details.contributions, (contribution) => contribution.lotId);

    return [...details.lots]
      .sort((first, second) => second.totalAmount - first.totalAmount)
      .map((lot) => {
        const contributions = contributionsByLotId.get(lot.id) ?? [];
        const contributorNames = contributions
          .sort(
            (first, second) =>
              getContributionWeightedTotal(second, details.auction.pointsToDonationRatio) -
              getContributionWeightedTotal(first, details.auction.pointsToDonationRatio),
          )
          .map((contribution) => resolveParticipantName(contribution.participantId));

        return {
          lot,
          contributions,
          contributorNames,
          bidsCount: contributions.reduce((sum, contribution) => sum + contribution.bidsCount, 0),
        };
      });
  }, [details.auction.pointsToDonationRatio, details.contributions, details.lots, resolveParticipantName]);

  const totalBids = details.contributions.reduce((sum, contribution) => sum + contribution.bidsCount, 0);
  const averageContribution = details.auction.participantCount
    ? getAuctionWeightedTotal(details.auction) / details.auction.participantCount
    : 0;
  const MethodIcon = details.auction.selectionMethod === 'wheel' ? IconDice5 : IconTargetArrow;

  return (
    <Stack gap='md'>
      <Group justify='space-between' align='flex-start'>
        <Group gap='md' align='flex-start' className='min-w-0'>
          <ThemeIcon size={58} radius='md' variant='gradient' gradient={{ from: 'violet', to: 'yellow' }}>
            <MethodIcon size={32} />
          </ThemeIcon>
          <div className='min-w-0'>
            <Button
              variant='subtle'
              color='gray'
              size='xs'
              leftSection={<IconArrowLeft size={14} />}
              onClick={onBack}
              mb={6}
            >
              {t('auctionHistory.actions.backToList')}
            </Button>
            <Title order={2} className='truncate'>
              {details.auction.name}
            </Title>
            <Group gap='xs' mt={4}>
              <Text size='sm' c='dimmed'>
                {formatDate(details.auction.startedAt)}
              </Text>
              <Badge variant='light' color='violet'>
                {formatDuration(details.auction.durationMs)}
              </Badge>
              <Badge variant='light' color={details.auction.selectionMethod === 'wheel' ? 'yellow' : 'teal'}>
                {t(`auctionHistory.selectionMethod.${details.auction.selectionMethod}`)}
              </Badge>
            </Group>
          </div>
        </Group>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, xl: 6 }} spacing='sm'>
        <AuctionMetricCard
          label={t('auctionHistory.metrics.lots')}
          value={details.auction.lotCount}
          icon={IconCards}
          color='yellow'
        />
        <AuctionMetricCard
          label={t('auctionHistory.metrics.bids')}
          value={totalBids}
          icon={IconTicket}
          color='violet'
        />
        <AuctionMetricCard
          label={t('auctionHistory.metrics.participants')}
          value={details.auction.participantCount}
          icon={IconUsers}
          color='grape'
        />
        <AuctionMetricCard
          label={t('auctionHistory.metrics.points')}
          value={formatCompactNumber(details.auction.totalPoints)}
          icon={IconWallet}
          color='teal'
        />
        <AuctionMetricCard
          label={t('auctionHistory.metrics.donations')}
          value={formatCompactMoney(details.auction.totalDonationCents)}
          icon={IconHeart}
          color='red'
        />
        <AuctionMetricCard
          label={t('auctionHistory.metrics.averageContribution')}
          value={formatCompactNumber(averageContribution)}
          icon={IconClock}
          color='cyan'
        />
      </SimpleGrid>
      <Paper withBorder radius='md' p='md' className='border-yellow-400/20 bg-white/[0.035]'>
        <Group justify='space-between' mb='md'>
          <Title order={3} size='h4'>
            {t('auctionHistory.sections.requestLots')}
          </Title>
          <Badge color='yellow' variant='light'>
            {winnerLot?.name ?? t('auctionHistory.empty.noWinner')}
          </Badge>
        </Group>
        <Stack gap='sm'>
          {lotRows.map(({ lot, contributorNames, bidsCount }, index) => (
            <Paper key={lot.id} withBorder radius='md' p='sm' className='border-white/10 bg-black/10'>
              <div className='grid grid-cols-1 gap-3 lg:grid-cols-[56px_minmax(0,1fr)_220px_140px] lg:items-center'>
                <ThemeIcon radius='md' color={winnerLot?.id === lot.id ? 'yellow' : 'gray'} variant='light' size={48}>
                  <Text fw={900}>{index + 1}</Text>
                </ThemeIcon>
                <div className='min-w-0'>
                  <Tooltip
                    label={lot.name || t('auctionHistory.empty.unnamedLot')}
                    disabled={(lot.name?.length ?? 0) < 72}
                  >
                    <Text fw={800} className='line-clamp-2'>
                      {lot.name || t('auctionHistory.empty.unnamedLot')}
                    </Text>
                  </Tooltip>
                  <Group gap={4} mt={6}>
                    {contributorNames.slice(0, 4).map((name) => (
                      <Avatar key={name} size='sm' radius='xl' color='violet'>
                        {name.slice(0, 2).toUpperCase()}
                      </Avatar>
                    ))}
                    {contributorNames.length > 4 && (
                      <Badge variant='light' color='gray'>
                        +{contributorNames.length - 4}
                      </Badge>
                    )}
                  </Group>
                </div>
                <div>
                  <Text size='xs' fw={800} tt='uppercase' c='dimmed'>
                    {t('auctionHistory.metrics.totalAmount')}
                  </Text>
                  <Text fw={900}>{formatCompactNumber(lot.totalAmount)}</Text>
                  <Text size='xs' c='dimmed'>
                    {formatCompactNumber(lot.totalPoints)} · {formatMoney(lot.totalDonationCents)}
                  </Text>
                </div>
                <Badge variant='light' color='teal' size='lg'>
                  {t('auctionHistory.lots.bidsCount', { count: bidsCount })}
                </Badge>
              </div>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default SelectedAuctionView;
