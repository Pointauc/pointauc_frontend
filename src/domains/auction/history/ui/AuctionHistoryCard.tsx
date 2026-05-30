import { Badge, Text, Tooltip } from '@mantine/core';
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

import { auctionHistoryMetricColors } from '../config/metricColors';
import { formatCompactMoney, formatCompactNumber, formatDate, formatDuration } from '../lib/formatters';

import type { ReactNode } from 'react';
import type { AuctionCardSummary, StatusFlavor } from '../lib/statistics';

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

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const AuctionStat = ({ icon, label, tooltip, value, color }: AuctionStatProps) => (
  <Tooltip label={tooltip} withArrow>
    <div className='text-paper-100 flex min-w-0 items-center gap-2'>
      <span className='text-paper-200' style={{ color }}>
        {icon}
      </span>
      <span className='sr-only'>{label}</span>
      <Text component='span' size='md' fw={500} className='text-paper-100 truncate' style={{ color }}>
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
  const hasWinner = Boolean(summary.winnerLot || summary.winnerName);
  const winnerName = summary.winnerName ?? t('auctionHistory.empty.noWinner');

  return (
    <button
      type='button'
      onClick={() => onSelect(summary.auction.id)}
      className='group elevated-2 border-paper-600 bg-paper-800 hover:border-paper-500 hover:bg-paper-700 focus:ring-primary-400/60 grid w-full grid-cols-1 items-stretch gap-0 overflow-hidden rounded-md border text-left transition-colors duration-150 focus:ring-2 focus:outline-none lg:grid-cols-[96px_minmax(0,1fr)_minmax(230px,0.5fr)_40px]'
      aria-label={t('auctionHistory.actions.openAuction')}
    >
      <div className='border-paper-600 flex items-center justify-center border-b p-1 lg:border-r lg:border-b-0'>
        <div className='flex size-[88px] items-center justify-center'>
          <MethodIcon
            aria-label={t(`auctionHistory.selectionMethod.${summary.auction.selectionMethod}`)}
            className='size-full'
            role='img'
          />
        </div>
      </div>

      <div className='min-w-0 px-3 py-3 sm:px-4'>
        <Text size='24px' fw={700} lh={1.1} className='text-paper-50 min-w-0 truncate'>
          {summary.auction.name}
        </Text>

        <div className='text-paper-200 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
          <Tooltip label={t('auctionHistory.card.tooltips.date')} withArrow>
            <div className='flex items-center gap-2'>
              <IconCalendar size={19} />
              <Text component='span' size='md' className='text-paper-200'>
                {formatDate(summary.auction.startedAt)}
              </Text>
            </div>
          </Tooltip>
          <span className='text-paper-300'>{'\u00b7'}</span>
          <Tooltip label={t('auctionHistory.card.tooltips.duration')} withArrow>
            <div className='flex items-center gap-2'>
              <IconClock size={20} />
              <Text component='span' size='md' className='text-paper-200'>
                {formatDuration(summary.auction.durationMs)}
              </Text>
            </div>
          </Tooltip>
          <Tooltip label={t(`auctionHistory.statusFlavors.${summary.flavor.key}.tooltip`)} withArrow>
            <Badge variant='outline' radius='sm' className={`shrink-0 normal-case ${flavorClassName}`}>
              {t(`auctionHistory.statusFlavors.${summary.flavor.key}.label`)}
            </Badge>
          </Tooltip>
        </div>

        <div className='border-paper-600 mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-2 sm:grid-cols-5'>
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
            color={auctionHistoryMetricColors.points}
          />
          <AuctionStat
            icon={<IconHeartFilled size={22} />}
            label={t('auctionHistory.metrics.donations')}
            tooltip={t('auctionHistory.card.tooltips.donations')}
            value={formatCompactMoney(summary.auction.totalDonationCents)}
            color={auctionHistoryMetricColors.donations}
          />
        </div>
      </div>

      <div className='border-paper-600 min-w-0 border-t px-3 py-3 sm:px-4 lg:border-t-0 lg:border-l'>
        <Text size='xs' fw={700} tt='uppercase' className='text-paper-300'>
          {t('auctionHistory.card.winnerLine')}
        </Text>
        <div className='mt-2 min-w-0'>
          <Text size='lg' fw={700} className='text-paper-50 truncate'>
            {hasWinner
              ? t('auctionHistory.card.winnerRequest', {
                  request: winnerLotName,
                  chance: winnerChance,
                })
              : t('auctionHistory.empty.noWinner')}
          </Text>
          <div className='mt-2 flex min-w-0 items-center gap-2'>
            <div className='border-paper-500 bg-paper-900 text-paper-100 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold'>
              {getInitials(winnerName)}
            </div>
            <Text size='md' className='text-paper-200 min-w-0 truncate'>
              {winnerName}
            </Text>
          </div>
        </div>
      </div>

      <div className='text-paper-300 group-hover:text-paper-100 hidden items-center justify-center transition-colors lg:flex'>
        <IconChevronRight size={30} stroke={2.25} />
      </div>
    </button>
  );
};

export default AuctionHistoryCard;
