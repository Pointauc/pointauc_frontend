import { DonutChart, type DonutChartCell } from '@mantine/charts';
import { Paper, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconCoins, IconGavel, IconHeartFilled } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { auctionHistoryMetricColors } from '../config/metricColors';
import { formatCompactMoney, formatCompactNumber } from '../lib/formatters';

import type { TFunction } from 'i18next';
import type { RangeTotals } from '../lib/statistics';

interface ContributionBreakdownCardProps {
  totals: RangeTotals;
  pointsShare: number;
  donationShare: number;
  className?: string;
}

interface ContributionMetricProps {
  value: string;
  label: string;
  share: number;
  color: string;
  align?: 'start' | 'end';
}

const buildContributionData = (pointsShare: number, donationShare: number, translate: TFunction): DonutChartCell[] => [
  { name: translate('auctionHistory.metrics.points'), value: pointsShare, color: auctionHistoryMetricColors.points },
  {
    name: translate('auctionHistory.metrics.donations'),
    value: donationShare,
    color: auctionHistoryMetricColors.donations,
  },
];

const getBoundedChartSize = (width: number, height: number): number => {
  if (!width || !height) {
    return 148;
  }

  return Math.round(Math.min(180, Math.max(96, Math.min(height, width * 0.34))));
};

const ContributionMetric = ({ value, label, share, color, align = 'start' }: ContributionMetricProps) => (
  <div className={`min-w-0 ${align === 'end' ? 'text-right' : 'text-left'}`}>
    <Text fw={900} size='xl' lh={1.05} className='truncate' style={{ color }}>
      {value}
    </Text>
    <div className={`bg-paper-500 my-2 h-px w-full max-w-24 ${align === 'end' ? 'ml-auto' : ''}`} aria-hidden='true' />
    <Text size='sm' c='dimmed' fw={600} className='truncate'>
      {label}
    </Text>
    <Text fw={900} size='xl' lh={1.05} mt={2} style={{ color }}>
      {Math.round(share)}%
    </Text>
  </div>
);

const ContributionDonut = ({ data, size }: { data: DonutChartCell[]; size: number }) => (
  <div className='relative flex shrink-0 items-center justify-center'>
    <DonutChart
      data={data}
      size={size}
      thickness={Math.max(18, Math.round(size * 0.19))}
      paddingAngle={4}
      tooltipDataSource='segment'
      startAngle={92}
      endAngle={452}
      pieProps={{ cornerRadius: '10%' }}
      valueFormatter={(value) => `${Math.round(value)}%`}
    />
    <div className='absolute inset-0 flex items-center justify-center'>
      <div
        className='flex items-center justify-center gap-1 rounded-full'
        style={{ width: size * 0.43, height: size * 0.43 }}
      >
        <IconCoins size={Math.round(size * 0.18)} color={auctionHistoryMetricColors.points} />
        <IconHeartFilled size={Math.round(size * 0.2)} color={auctionHistoryMetricColors.donations} />
      </div>
    </div>
  </div>
);

const ContributionBreakdownCard = ({
  totals,
  pointsShare,
  donationShare,
  className,
}: ContributionBreakdownCardProps) => {
  const { t } = useTranslation();
  const { ref: contentRef, width: contentWidth, height: contentHeight } = useElementSize();
  const data = useMemo(() => buildContributionData(pointsShare, donationShare, t), [donationShare, pointsShare, t]);
  const chartSize = getBoundedChartSize(contentWidth, contentHeight);

  return (
    <Paper withBorder radius='md' p='md' className={`flex min-h-0 flex-col overflow-hidden ${className ?? ''}`}>
      <div className='mb-3 flex items-center gap-2'>
        <IconGavel size={24} className='text-yellow-300' />
        <Title order={3} size='h4'>
          {t('auctionHistory.sections.pointsVsDonations')}
        </Title>
      </div>
      <div
        ref={contentRef}
        className='grid min-h-0 flex-1 grid-cols-1 items-center gap-4 overflow-hidden sm:grid-cols-[minmax(80px,1fr)_auto_minmax(80px,1fr)]'
      >
        <ContributionMetric
          value={formatCompactNumber(totals.totalPoints)}
          label={t('auctionHistory.metrics.points')}
          share={pointsShare}
          color={auctionHistoryMetricColors.points}
        />
        <ContributionDonut data={data} size={chartSize} />
        <ContributionMetric
          value={formatCompactMoney(totals.totalDonationCents)}
          label={t('auctionHistory.metrics.donations')}
          share={donationShare}
          color={auctionHistoryMetricColors.donations}
          align='end'
        />
      </div>
    </Paper>
  );
};

export default ContributionBreakdownCard;
