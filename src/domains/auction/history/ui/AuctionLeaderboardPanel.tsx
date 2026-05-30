import { DonutChart, type DonutChartCell } from '@mantine/charts';
import { Avatar, Badge, Button, Chip, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconArrowRight, IconCrown, IconHeart, IconMedal, IconMoodEmpty, IconTournament } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatCompactNumber } from '../lib/formatters';
import {
  sortParticipantScores,
  type LeaderboardSort,
  type ParticipantScore,
  type RangeTotals,
} from '../lib/statistics';

import type { ReactNode } from 'react';

type TranslationFunction = ReturnType<typeof useTranslation>['t'];

interface AuctionLeaderboardPanelProps {
  scores: ParticipantScore[];
  totals: RangeTotals;
  isSelectedAuction: boolean;
  contextStats: AuctionContextStat[];
}

export interface AuctionContextStat {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon: ReactNode;
  color: string;
}

const getScoreValue = (score: ParticipantScore, sort: LeaderboardSort): string => {
  if (sort === 'points') {
    return formatCompactNumber(score.points);
  }

  if (sort === 'donations') {
    return formatCompactMoney(score.donationCents);
  }

  if (sort === 'participation') {
    return String(score.participation);
  }

  if (sort === 'streak') {
    return String(score.streak);
  }

  return String(score.wins);
};

const medalColors = ['yellow', 'gray', 'orange'];
const leaderboardCollapsedLimit = 5;
const leaderboardExpandedLimit = 20;

const getScoreInitials = (displayName: string): string => displayName.slice(0, 2).toUpperCase();

const buildContributionData = (pointsShare: number, donationShare: number, translate: TranslationFunction) =>
  [
    { name: translate('auctionHistory.metrics.points'), value: pointsShare, color: 'teal.6' },
    { name: translate('auctionHistory.metrics.donations'), value: donationShare, color: 'red.6' },
  ] satisfies DonutChartCell[];

const PodiumUser = ({ score, index, sort }: { score: ParticipantScore; index: number; sort: LeaderboardSort }) => {
  const medalColor = medalColors[index] ?? 'violet';
  const Icon = index === 0 ? IconCrown : IconMedal;

  return (
    <div className={`flex flex-1 flex-col items-center ${index === 0 ? 'pt-0' : 'pt-8'}`}>
      <ThemeIcon color={medalColor} variant='light' radius='xl' size={index === 0 ? 46 : 34}>
        <Icon size={index === 0 ? 30 : 22} />
      </ThemeIcon>
      <Avatar mt='xs' size={index === 0 ? 64 : 52} radius='xl' color={medalColor}>
        {getScoreInitials(score.displayName)}
      </Avatar>
      <Text mt='xs' fw={800} size='sm' ta='center' className='max-w-28 truncate'>
        {score.displayName}
      </Text>
      <Badge color='teal' variant='light' mt={4}>
        {getScoreValue(score, sort)}
      </Badge>
    </div>
  );
};

interface LeaderboardRowsProps {
  scores: ParticipantScore[];
  sort: LeaderboardSort;
}

const LeaderboardRows = ({ scores, sort }: LeaderboardRowsProps) => (
  <Stack gap={6}>
    {scores.map((score, index) => (
      <Group key={score.id} justify='space-between' className='rounded-md border border-white/10 bg-black/10 px-3 py-2'>
        <Group gap='sm' className='min-w-0' wrap='nowrap'>
          <Text c='dimmed' fw={800} w={22}>
            {index + 4}
          </Text>
          <Avatar size='sm' radius='xl' color='violet'>
            {getScoreInitials(score.displayName)}
          </Avatar>
          <Text size='sm' fw={600} className='truncate'>
            {score.displayName}
          </Text>
        </Group>
        <Badge color='teal' variant='light'>
          {getScoreValue(score, sort)}
        </Badge>
      </Group>
    ))}
  </Stack>
);

interface EmptyLeaderboardProps {
  label: string;
}

const EmptyLeaderboard = ({ label }: EmptyLeaderboardProps) => (
  <Stack align='center' py='xl'>
    <ThemeIcon color='gray' variant='light' size='xl' radius='xl'>
      <IconMoodEmpty />
    </ThemeIcon>
    <Text size='sm' c='dimmed'>
      {label}
    </Text>
  </Stack>
);

interface LeaderboardSectionProps {
  sort: LeaderboardSort;
  sortOptions: LeaderboardSort[];
  sortedScores: ParticipantScore[];
  visibleScores: ParticipantScore[];
  isExpanded: boolean;
  onSortChange: (sort: LeaderboardSort) => void;
  onExpandedChange: (isExpanded: boolean) => void;
}

const LeaderboardSection = ({
  sort,
  sortOptions,
  sortedScores,
  visibleScores,
  isExpanded,
  onSortChange,
  onExpandedChange,
}: LeaderboardSectionProps) => {
  const { t: translate } = useTranslation();

  return (
    <Paper withBorder radius='md' p='md'>
      <Group gap={6} mb='md'>
        <Title order={3} size='h4' className='mr-2'>
          {translate('auctionHistory.sections.topParticipants')}
        </Title>
        <Chip.Group value={sort} onChange={(value) => onSortChange(value as LeaderboardSort)}>
          {sortOptions.map((option) => (
            <Chip key={option} value={option} size='xs' variant='light'>
              {translate(`auctionHistory.leaderboard.sort.${option}`)}
            </Chip>
          ))}
        </Chip.Group>
      </Group>
      {visibleScores.length === 0 ? (
        <EmptyLeaderboard label={translate('auctionHistory.empty.noParticipants')} />
      ) : (
        <>
          <Group align='flex-end' justify='center' gap='xs' mb='lg' wrap='nowrap'>
            {sortedScores.slice(0, 3).map((score, index) => (
              <PodiumUser key={score.id} score={score} index={index} sort={sort} />
            ))}
          </Group>
          <LeaderboardRows scores={visibleScores.slice(3)} sort={sort} />
          {sortedScores.length > leaderboardCollapsedLimit && (
            <Button
              fullWidth
              mt='md'
              variant='light'
              color='gray'
              rightSection={<IconArrowRight size={16} />}
              onClick={() => onExpandedChange(!isExpanded)}
            >
              {isExpanded
                ? translate('auctionHistory.actions.collapseLeaderboard')
                : translate('auctionHistory.actions.viewMoreUsers')}
            </Button>
          )}
        </>
      )}
    </Paper>
  );
};

interface ContributionChartSectionProps {
  totals: RangeTotals;
  pointsShare: number;
  donationShare: number;
}

const ContributionChartSection = ({ totals, pointsShare, donationShare }: ContributionChartSectionProps) => {
  const { t: translate } = useTranslation();
  const data = useMemo(
    () => buildContributionData(pointsShare, donationShare, translate),
    [donationShare, pointsShare, translate],
  );

  return (
    <Paper withBorder radius='md' p='md' className='border-white/10 bg-white/[0.035]'>
      <Title order={3} size='h4' mb='md'>
        {translate('auctionHistory.sections.pointsVsDonations')}
      </Title>
      <Group justify='center' align='center'>
        <DonutChart
          data={data}
          size={180}
          thickness={24}
          paddingAngle={2}
          chartLabel={formatCompactNumber(totals.weightedTotal)}
          tooltipDataSource='segment'
          valueFormatter={(value) => `${Math.round(value)}%`}
        />
      </Group>
      <Stack gap='xs' mt='sm'>
        <Group justify='space-between'>
          <Group gap='xs'>
            <ThemeIcon size='sm' radius='xl' color='teal' variant='light'>
              <IconTournament size={14} />
            </ThemeIcon>
            <Text size='sm'>{translate('auctionHistory.metrics.points')}</Text>
          </Group>
          <Text size='sm' fw={700}>
            {Math.round(pointsShare)}%
          </Text>
        </Group>
        <Group justify='space-between'>
          <Group gap='xs'>
            <ThemeIcon size='sm' radius='xl' color='red' variant='light'>
              <IconHeart size={14} />
            </ThemeIcon>
            <Text size='sm'>{translate('auctionHistory.metrics.donations')}</Text>
          </Group>
          <Text size='sm' fw={700}>
            {Math.round(donationShare)}%
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

interface ContextStatsGridProps {
  stats: AuctionContextStat[];
}

const ContextStatsGrid = ({ stats }: ContextStatsGridProps) => (
  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1'>
    {stats.map((stat) => (
      <Paper key={stat.label} withBorder radius='md' p='md' className='border-white/10 bg-white/[0.035]'>
        <Group gap='sm' align='flex-start' wrap='nowrap'>
          <ThemeIcon color={stat.color} variant='light' radius='md'>
            {stat.icon}
          </ThemeIcon>
          <div className='min-w-0'>
            <Text size='xs' fw={800} tt='uppercase' c='dimmed'>
              {stat.label}
            </Text>
            <Text fw={900} size='xl' className='truncate'>
              {stat.value}
            </Text>
            {stat.helper && (
              <Text size='xs' c='dimmed' className='truncate'>
                {stat.helper}
              </Text>
            )}
          </div>
        </Group>
      </Paper>
    ))}
  </div>
);

const AuctionLeaderboardPanel = ({ scores, totals, isSelectedAuction, contextStats }: AuctionLeaderboardPanelProps) => {
  const [sort, setSort] = useState<LeaderboardSort>('wins');
  const [isExpanded, setIsExpanded] = useState(false);
  const sortOptions: LeaderboardSort[] = isSelectedAuction
    ? ['wins', 'points', 'donations', 'participation']
    : ['wins', 'points', 'donations', 'participation', 'streak'];
  const sortedScores = useMemo(() => sortParticipantScores(scores, sort), [scores, sort]);
  const visibleScores = isExpanded
    ? sortedScores.slice(0, leaderboardExpandedLimit)
    : sortedScores.slice(0, leaderboardCollapsedLimit);
  const pointsShare = totals.weightedTotal
    ? ((totals.weightedTotal - totals.weightedDonationPoints) / totals.weightedTotal) * 100
    : 0;
  const donationShare = totals.weightedTotal ? (totals.weightedDonationPoints / totals.weightedTotal) * 100 : 0;

  return (
    <Stack gap='md' className='xl:sticky xl:top-4'>
      <LeaderboardSection
        sort={sort}
        sortOptions={sortOptions}
        sortedScores={sortedScores}
        visibleScores={visibleScores}
        isExpanded={isExpanded}
        onSortChange={setSort}
        onExpandedChange={setIsExpanded}
      />
      {!isExpanded && (
        <>
          <ContributionChartSection totals={totals} pointsShare={pointsShare} donationShare={donationShare} />
          <ContextStatsGrid stats={contextStats} />
        </>
      )}
    </Stack>
  );
};

export default AuctionLeaderboardPanel;
