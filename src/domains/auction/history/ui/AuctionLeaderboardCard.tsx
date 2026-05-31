import { Button, Chip, Group, Paper, Title } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { type LeaderboardSort, type ParticipantScore } from '../lib/statistics';

import EmptyLeaderboard from './EmptyLeaderboard';
import LeaderboardRows from './LeaderboardRows';
import ParticipantPodiumItem from './ParticipantPodiumItem';

interface AuctionLeaderboardCardProps {
  sort: LeaderboardSort;
  sortOptions: LeaderboardSort[];
  sortedScores: ParticipantScore[];
  visibleScores: ParticipantScore[];
  isExpanded: boolean;
  hasMoreScores: boolean;
  className?: string;
  onSortChange: (sort: LeaderboardSort) => void;
  onExpandedChange: (isExpanded: boolean) => void;
}

const AuctionLeaderboardCard = ({
  sort,
  sortOptions,
  sortedScores,
  visibleScores,
  isExpanded,
  hasMoreScores,
  className,
  onSortChange,
  onExpandedChange,
}: AuctionLeaderboardCardProps) => {
  const { t } = useTranslation();
  const topScores = sortedScores.slice(0, 3);
  const rowScores = visibleScores.slice(3);

  return (
    <Paper withBorder radius='md' p='md' className={`flex min-h-0 flex-col ${className ?? ''}`}>
      <Group gap={6} mb='sm' align='flex-start'>
        <Title order={3} size='h4' className='mr-2 shrink-0'>
          {t('auctionHistory.sections.topParticipants')}
        </Title>
        <Chip.Group value={sort} onChange={(value) => onSortChange(value as LeaderboardSort)}>
          <Group gap={6}>
            {sortOptions.map((option) => (
              <Chip key={option} value={option} size='xs' variant='light'>
                {t(`auctionHistory.leaderboard.sort.${option}`)}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>
      {visibleScores.length === 0 ? (
        <EmptyLeaderboard label={t('auctionHistory.empty.noParticipants')} />
      ) : (
        <div className='flex min-h-0 flex-1 flex-col'>
          <Group align='flex-end' justify='center' gap='xs' mb='sm' wrap='nowrap'>
            <ParticipantPodiumItem score={topScores[1]} index={1} sort={sort} />
            <ParticipantPodiumItem score={topScores[0]} index={0} sort={sort} />
            <ParticipantPodiumItem score={topScores[2]} index={2} sort={sort} />
          </Group>
          <LeaderboardRows scores={rowScores} sort={sort} />
          {hasMoreScores && (
            <Button
              fullWidth
              mt='auto'
              size='sm'
              variant='light'
              color='gray.8'
              className='!mt-2'
              rightSection={isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => onExpandedChange(!isExpanded)}
            >
              {isExpanded ? t('auctionHistory.actions.collapseLeaderboard') : t('auctionHistory.actions.viewMoreUsers')}
            </Button>
          )}
        </div>
      )}
    </Paper>
  );
};

export default AuctionLeaderboardCard;
