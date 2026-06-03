import { ActionIcon, Alert, Button, Group, Modal, Paper, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCalendar,
  IconChevronRight,
  IconClock,
  IconCube,
  IconHistory,
  IconDiamond,
  IconHeartFilled,
  IconTicket,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import DirectMethodIcon from '@assets/img/auction_method_direct.svg?react';
import WheelMethodIcon from '@assets/img/auction_method_wheel.svg?react';
import LotContributorSummary from '@shared/ui/LotContributorSummary';

import { auctionHistoryMetricColors } from '../config/metricColors';
import { formatCompactMoney, formatCompactNumber, formatDuration, formatSmartDate } from '../lib/formatters';

import type { MouseEvent, ReactNode } from 'react';
import type { AuctionCardSummary } from '../lib/statistics';

interface AuctionHistoryCardProps {
  summary: AuctionCardSummary;
  isCurrentAuctionEmpty: boolean;
  isDeleting?: boolean;
  isRestoring?: boolean;
  onSelect: (auctionId: string) => void;
  onDelete: (auctionId: string) => void;
  onRestore: (auctionId: string) => Promise<void>;
}

interface AuctionStatProps {
  icon: ReactNode;
  label: string;
  tooltip: string;
  value: ReactNode;
  color?: string;
  isDimmed?: boolean;
}

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

const AuctionHistoryCard = ({
  summary,
  isCurrentAuctionEmpty,
  isDeleting,
  isRestoring,
  onSelect,
  onDelete,
  onRestore,
}: AuctionHistoryCardProps) => {
  const { t } = useTranslation();
  const [restoreModalOpened, setRestoreModalOpened] = useState(false);
  const MethodIcon = methodImageByType[summary.auction.selectionMethod];
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

  const handleRestore = async (): Promise<void> => {
    await onRestore(summary.auction.id);
    setRestoreModalOpened(false);
  };

  const handleRestoreClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    if (isCurrentAuctionEmpty) {
      handleRestore().catch((err) => console.error(err));
      return;
    }

    setRestoreModalOpened(true);
  };

  return (
    <>
      <Paper
        role='button'
        tabIndex={0}
        onClick={() => onSelect(summary.auction.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(summary.auction.id);
          }
        }}
        className='group elevated-2 hover:bg-primary-400/10 focus:ring-primary-400/60 grid h-[86px] w-full grid-cols-1 items-stretch gap-0 overflow-hidden text-left transition-colors duration-150 hover:cursor-pointer focus:ring-2 focus:outline-none lg:grid-cols-[96px_minmax(0,1fr)_minmax(230px,0.5fr)_40px]'
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
          <div className='flex min-w-0 items-center gap-x-3 gap-y-1'>
            <Text size='xl' fw={700} className='group-hover:text-primary-300 min-w-0 truncate transition-colors'>
              {summary.auction.name}
            </Text>
            {/* <Tooltip label={t(`auctionHistory.statusFlavors.${summary.flavor.key}.tooltip`)} withArrow>
            <Badge variant='outline' radius='sm' className={`shrink-0 normal-case ${flavorClassName}`}>
              {t(`auctionHistory.statusFlavors.${summary.flavor.key}.label`)}
            </Badge>
          </Tooltip> */}
            <Group
              gap={4}
              className='pointer-events-none ml-auto shrink-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip label={t('auctionHistory.actions.restoreAuction')} withArrow>
                <ActionIcon
                  variant='subtle'
                  color='primary'
                  size='md'
                  aria-label={t('auctionHistory.actions.restoreAuction')}
                  loading={isRestoring}
                  onClick={handleRestoreClick}
                >
                  <IconHistory size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('auctionHistory.actions.deleteAuction')} withArrow>
                <ActionIcon
                  variant='subtle'
                  color='red'
                  size='md'
                  aria-label={t('auctionHistory.actions.deleteAuction')}
                  loading={isDeleting}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(summary.auction.id);
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
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
            <Text size='md' fw={600} className='group-hover:text-primary-300 truncate transition-colors'>
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

        <div className='text-paper-300 group-hover:text-primary-200 hidden items-center justify-center transition-colors lg:flex'>
          <IconChevronRight size={30} stroke={2.25} />
        </div>
      </Paper>
      <Modal
        opened={restoreModalOpened}
        onClose={() => setRestoreModalOpened(false)}
        title={t('auctionHistory.restore.title')}
        centered
        radius='md'
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertTriangle size={18} />} color='blue' variant='light'>
            {t('auctionHistory.restore.warning')}
          </Alert>
          <Group justify='end'>
            <Button variant='light' color='gray.8' onClick={() => setRestoreModalOpened(false)}>
              {t('auctionHistory.restore.cancel')}
            </Button>
            <Button
              color='primary'
              loading={isRestoring}
              onClick={() => handleRestore().catch((err) => console.error(err))}
            >
              {t('auctionHistory.restore.confirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AuctionHistoryCard;
