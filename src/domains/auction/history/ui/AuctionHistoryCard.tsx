import { Badge, Paper, Text, Tooltip } from '@mantine/core';
import {
  IconCalendar,
  IconChevronRight,
  IconClock,
  IconCube,
  IconDiamond,
  IconHeartFilled,
  IconTicket,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import DirectMethodIcon from '@assets/img/auction_method_direct.svg?react';
import WheelMethodIcon from '@assets/img/auction_method_wheel.svg?react';
import LotContributorSummary from '@shared/ui/LotContributorSummary';

import { auctionHistoryMetricColors } from '../config/metricColors';
import { formatCompactMoney, formatCompactNumber, formatDuration, formatSmartDate } from '../lib/formatters';

import type { ReactNode } from 'react';
import type { AuctionCardSummary } from '../lib/statistics';

interface AuctionHistoryCardProps {
  summary: AuctionCardSummary;
  onSelect: (auctionId: string) => void;
}

interface AuctionStatProps {
  icon: ReactNode;
  label: string;
  tooltip: string;
  value: ReactNode;
  color?: string;
  isDimmed?: boolean;
}

const flavorClassNames: Record<string, string> = {
  cyan: 'border-cyan-400/45 bg-paper-transparent-400 text-cyan-100',
  grape: 'border-violet-400/45 bg-paper-transparent-400 text-violet-100',
  indigo: 'border-indigo-400/45 bg-paper-transparent-400 text-indigo-100',
  orange: 'border-orange-400/45 bg-paper-transparent-400 text-orange-100',
  pink: 'border-pink-400/45 bg-paper-transparent-400 text-pink-100',
  yellow: 'border-yellow-400/45 bg-paper-transparent-400 text-yellow-100',
};

const methodImageByType = {
  direct: DirectMethodIcon,
  wheel: WheelMethodIcon,
};

const AuctionStat = ({ icon, label, tooltip, value, color, isDimmed }: AuctionStatProps) => (
  <Tooltip label={tooltip} withArrow>
    <div className='text-paper-100 flex min-w-0 items-center gap-1'>
      <span className={isDimmed ? 'text-paper-400' : 'text-paper-300'} style={{ color }}>
        {icon}
      </span>
      <span className='sr-only'>{label}</span>
      <Text
        component='span'
        size='md'
        fw={500}
        className={`${isDimmed ? 'text-paper-400' : 'text-paper-50'}`}
        style={{ color }}
      >
        {value}
      </Text>
    </div>
  </Tooltip>
);

const AuctionHistoryCard = ({ summary, onSelect }: AuctionHistoryCardProps) => {
  const { t } = useTranslation();
  const MethodIcon = methodImageByType[summary.auction.selectionMethod];
  const flavorClassName = flavorClassNames[summary.flavor.color] ?? flavorClassNames.cyan;
  const winnerLotName = summary.winnerLot?.name ?? t('auctionHistory.empty.unnamedLot');
  const winnerChance = summary.winnerChancePercent
    ? t('auctionHistory.card.winnerChance', { chance: Math.round(summary.winnerChancePercent) })
    : '';
  const hasWinnerUsers = summary.winnerContributors.length > 0;
  const hasPoints = summary.auction.totalPoints > 0;
  const hasDonations = summary.auction.totalDonationCents > 0;
  const startedAtLabel = formatSmartDate(summary.auction.startedAt, {
    todayAt: (time) => t('auctionHistory.card.dateLabels.todayAt', { time }),
    yesterdayAt: (time) => t('auctionHistory.card.dateLabels.yesterdayAt', { time }),
  });

  return (
    <Paper
      component='button'
      type='button'
      onClick={() => onSelect(summary.auction.id)}
      className='group elevated-2 hover:bg-paper-600 focus:ring-primary-400/60 grid h-[86px] w-full grid-cols-1 items-stretch gap-0 overflow-hidden text-left transition-colors duration-150 hover:cursor-pointer focus:ring-2 focus:outline-none lg:grid-cols-[96px_minmax(0,1fr)_minmax(230px,0.5fr)_40px]'
      aria-label={t('auctionHistory.actions.openAuction')}
    >
      <div className='border-paper-600 flex items-center justify-center border-b p-1'>
        <div className='flex size-[78px] items-center justify-center'>
          <MethodIcon
            aria-label={t(`auctionHistory.selectionMethod.${summary.auction.selectionMethod}`)}
            className='size-full'
            role='img'
          />
        </div>
      </div>

      <div className='flex min-w-0 flex-col justify-center px-1 py-2'>
        <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1'>
          <Text size='xl' fw={700} className='min-w-0 truncate'>
            {summary.auction.name}
          </Text>
          {/* <Tooltip label={t(`auctionHistory.statusFlavors.${summary.flavor.key}.tooltip`)} withArrow>
            <Badge variant='outline' radius='sm' className={`shrink-0 normal-case ${flavorClassName}`}>
              {t(`auctionHistory.statusFlavors.${summary.flavor.key}.label`)}
            </Badge>
          </Tooltip> */}
        </div>

        <div className='text-paper-200 mt-1 grid grid-cols-2 items-center gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(154px,1fr)_minmax(60px,0.52fr)_repeat(5,minmax(50px,0.48fr))]'>
          <Tooltip label={t('auctionHistory.card.tooltips.date')} withArrow>
            <div className='flex min-w-0 items-center gap-1'>
              <IconCalendar size={19} className='text-paper-300 shrink-0' />
              <Text component='span' size='md' className='text-paper-200 truncate whitespace-nowrap'>
                {startedAtLabel}
              </Text>
            </div>
          </Tooltip>
          <AuctionStat
            icon={<IconClock size={20} />}
            label={t('auctionHistory.card.tooltips.duration')}
            tooltip={t('auctionHistory.card.tooltips.duration')}
            value={formatDuration(summary.auction.durationMs)}
          />
          <AuctionStat
            icon={<IconCube size={22} />}
            label={t('auctionHistory.metrics.lots')}
            tooltip={t('auctionHistory.card.tooltips.lots')}
            value={summary.auction.lotCount}
          />
          <AuctionStat
            icon={<IconTicket size={22} />}
            label={t('auctionHistory.metrics.bids')}
            tooltip={t('auctionHistory.card.tooltips.bids')}
            value={summary.bidCount}
          />
          <AuctionStat
            icon={<IconUsers size={22} />}
            label={t('auctionHistory.metrics.participants')}
            tooltip={t('auctionHistory.card.tooltips.participants')}
            value={summary.auction.participantCount}
          />
          <AuctionStat
            icon={<IconDiamond size={22} />}
            label={t('auctionHistory.metrics.points')}
            tooltip={t('auctionHistory.card.tooltips.points')}
            value={formatCompactNumber(summary.auction.totalPoints)}
            color={hasPoints ? auctionHistoryMetricColors.points : undefined}
            isDimmed={!hasPoints}
          />
          <AuctionStat
            icon={<IconHeartFilled size={22} />}
            label={t('auctionHistory.metrics.donations')}
            tooltip={t('auctionHistory.card.tooltips.donations')}
            value={formatCompactMoney(summary.auction.totalDonationCents)}
            color={hasDonations ? auctionHistoryMetricColors.donations : undefined}
            isDimmed={!hasDonations}
          />
        </div>
      </div>

      <div className='border-paper-600 flex min-w-0 flex-col justify-center border-t px-3 sm:px-4 lg:border-t-0 lg:border-l'>
        <Text size='xs' fw={700} tt='uppercase' className='text-paper-300'>
          {t('auctionHistory.card.winnerLine')}
        </Text>
        <div className='min-w-0'>
          <Text size='md' fw={600} className='truncate'>
            {summary.winnerLot
              ? t('auctionHistory.card.winnerRequest', {
                  request: winnerLotName,
                  chance: winnerChance,
                })
              : t('auctionHistory.empty.noWinner')}
          </Text>
          {hasWinnerUsers && (
            <div className='relative flex justify-start'>
              <LotContributorSummary contributors={summary.winnerContributors} hideAmounts extraPosition='inline' />
            </div>
          )}
        </div>
      </div>

      <div className='text-paper-300 group-hover:text-paper-100 hidden items-center justify-center transition-colors lg:flex'>
        <IconChevronRight size={30} stroke={2.25} />
      </div>
    </Paper>
  );
};

export default AuctionHistoryCard;
