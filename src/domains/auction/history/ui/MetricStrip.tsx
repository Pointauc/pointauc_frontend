import { IconCrown, IconDiamond, IconHeart, IconTicket, IconTrophy, IconUsers } from '@tabler/icons-react';
import { SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { auctionHistoryMetricColors } from '../config/metricColors';
import { formatCompactMoney, formatCompactNumber } from '../lib/formatters';

import AuctionMetricCard from './AuctionMetricCard';

import type { RangeTotals } from '../lib/statistics';

interface MetricStripProps {
  totals: RangeTotals;
  biggestWinningLotName?: string;
}

const MetricStrip = ({ totals, biggestWinningLotName }: MetricStripProps) => {
  const { t } = useTranslation();

  return (
    <SimpleGrid cols={{ base: 2, md: 3, xl: 6 }} spacing='md'>
      <AuctionMetricCard
        label={t('auctionHistory.metrics.auctions')}
        value={totals.totalAuctions}
        icon={IconTrophy}
        color={auctionHistoryMetricColors.auctions}
      />
      <AuctionMetricCard
        label={t('auctionHistory.metrics.participants')}
        value={formatCompactNumber(totals.totalParticipants)}
        icon={IconUsers}
        color={auctionHistoryMetricColors.participants}
      />
      <AuctionMetricCard
        label={t('auctionHistory.metrics.points')}
        value={formatCompactNumber(totals.totalPoints)}
        icon={IconDiamond}
        color={auctionHistoryMetricColors.points}
      />
      <AuctionMetricCard
        label={t('auctionHistory.metrics.donations')}
        value={formatCompactMoney(totals.totalDonationCents)}
        icon={IconHeart}
        color={auctionHistoryMetricColors.donations}
      />
      <AuctionMetricCard
        label={t('auctionHistory.metrics.bids')}
        value={formatCompactNumber(totals.totalBids)}
        icon={IconTicket}
        color={auctionHistoryMetricColors.bids}
      />
      <AuctionMetricCard
        label={t('auctionHistory.metrics.biggestWinningLot')}
        value={totals.biggestWinningLot ? formatCompactNumber(totals.biggestWinningLot.totalAmount) : '-'}
        helper={biggestWinningLotName}
        icon={IconCrown}
        color={auctionHistoryMetricColors.biggestWinningLot}
      />
    </SimpleGrid>
  );
};

export default MetricStrip;
